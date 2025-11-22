# 🔧 Notification Service 503 Error Fix

## Problem Summary

The notification service was experiencing recurring 503 errors on Render after some time, despite the keep-alive mechanism running. The issue occurred approximately every 10 minutes.

### Root Causes Identified

1. **Circular Keep-Alive Problem**: The service was pinging itself via `/health`, but when RabbitMQ disconnected, it returned 503. The keep-alive just logged the error but didn't attempt to fix it.

2. **RabbitMQ Connection Timeout**: After periods of inactivity, CloudAMQP or the connection itself would timeout, causing the connection to drop silently.

3. **Max Retry Exhaustion**: Once the service failed to connect 3 times, it gave up permanently and never tried again - even though the keep-alive was still pinging.

4. **No Proactive Health Monitoring**: There was no mechanism to periodically verify that RabbitMQ was still connected and working.

5. **Insufficient Retry Limit**: Only 3 retries wasn't enough for transient network issues or CloudAMQP temporary unavailability.

---

## Solutions Implemented

### 1. **Periodic Health Check System** ✅
**File**: `Backend/notification/src/broker/rabbit.js`

Added a new health check that runs every 5 minutes to:
- Verify the RabbitMQ connection is alive
- Test the channel by checking a queue
- Reset retry count on successful checks
- Automatically trigger reconnection if connection is stale

```javascript
// Runs every 5 minutes
startHealthCheck() {
  - Checks if connection exists
  - Verifies channel with checkQueue()
  - Resets retry count on success
  - Triggers reconnect if failed
}
```

**Benefits**:
- Detects connection issues before they cause errors
- Keeps connection fresh and active
- Prevents retry exhaustion
- Self-healing capability

---

### 2. **Increased Retry Limit** ✅
**File**: `Backend/notification/src/broker/rabbit.js`

Changed `MAX_RETRIES` from 3 to 5, providing more resilience against temporary network issues.

---

### 3. **Smart Keep-Alive with Auto-Reconnect** ✅
**File**: `Backend/notification/server.js`

Completely redesigned the keep-alive mechanism to:

**Before** ❌:
```javascript
// Just pinged /health every 10 minutes
// Logged 503 errors but did nothing
https.get(keepAliveUrl, (res) => {
  console.log(`Ping status: ${res.statusCode}`);
});
```

**After** ✅:
```javascript
// 1. Check /health every 8 minutes (more frequent)
// 2. If 503 detected, immediately POST to /reconnect
// 3. Verify reconnection was successful
// 4. Log detailed status
```

**Key improvements**:
- Reduced interval from 10m to 8m for faster detection
- Actively triggers reconnection when 503 detected
- Uses new `/reconnect` endpoint to force connection restoration
- Provides detailed logging of health and reconnection status

---

### 4. **New `/reconnect` Endpoint** ✅
**File**: `Backend/notification/src/App.js`

Added a new `POST /reconnect` endpoint that:
- Forces connection verification
- Resets retry count if exhausted
- Attempts reconnection if needed
- Returns detailed status

**Usage**:
```bash
curl -X POST https://rivo-notification.onrender.com/reconnect
```

**Response**:
```json
{
  "message": "Connection check completed",
  "rabbitmq": {
    "connected": true,
    "isConnecting": false,
    "retryCount": 0,
    "lastSuccessfulConnection": "2025-11-22T10:30:00.000Z"
  },
  "timestamp": "2025-11-22T10:30:00.000Z"
}
```

---

### 5. **ensureConnection() Function** ✅
**File**: `Backend/notification/src/broker/rabbit.js`

New exported function that:
- Checks if connection exists and is working
- Resets retry count if it was exhausted
- Forces reconnection if needed
- Verifies connection with actual queue check

**Used by**:
- The new `/reconnect` endpoint
- Can be called manually for debugging
- Used by keep-alive mechanism

---

## How It Works Now

### Normal Operation Flow:
```
1. Service starts → Connects to RabbitMQ
2. Health check runs every 5 minutes internally
   - Verifies connection is alive
   - Resets retry count
   
3. Keep-alive runs every 8 minutes externally
   - Pings /health endpoint
   - Gets 200 OK → All good
   
4. Connection stays healthy indefinitely
```

### Recovery Flow When Connection Drops:
```
1. RabbitMQ connection drops (timeout/network issue)

2. Next health check (within 5 minutes) detects issue
   - Logs: "Health check: Connection lost"
   - Automatically triggers reconnection
   
3. If reconnection fails:
   - /health returns 503
   
4. Keep-alive detects 503 (within 8 minutes)
   - Logs: "Service degraded, triggering reconnection"
   - POSTs to /reconnect endpoint
   
5. /reconnect endpoint:
   - Resets retry count if exhausted
   - Forces new connection attempt
   - Returns status
   
6. Connection restored → Service healthy again
```

---

## Expected Behavior

### Logs You Should See (Healthy):
```
✅ Connected to RabbitMQ successfully!
👂 Email listeners activated
[Keep-Alive] Enabled. Will check health every 8m
💚 Health check: RabbitMQ connection is healthy
[Keep-Alive] Health check status: 200
[Keep-Alive] ✅ Service healthy, RabbitMQ connected
```

### Logs During Recovery:
```
⚠️ Health check: Connection lost, attempting reconnect...
🔌 Connecting to RabbitMQ...
✅ Connected to RabbitMQ successfully!
[Keep-Alive] Service degraded (503), triggering reconnection...
[Keep-Alive] Reconnect attempt status: 200
[Keep-Alive] ✅ Reconnection successful!
```

---

## Testing the Fix

### 1. **Deploy to Render**
```bash
git add .
git commit -m "Fix notification service 503 errors with proactive health checks"
git push origin main
```

### 2. **Monitor Logs**
Watch for the health check messages every 5 minutes:
```
💚 Health check: RabbitMQ connection is healthy
```

### 3. **Test Reconnection Endpoint**
```bash
curl -X POST https://rivo-notification.onrender.com/reconnect
```

### 4. **Monitor for 2-3 Hours**
- Check that 503 errors don't recur
- Verify keep-alive logs show consistent 200 status
- Test email sending still works

### 5. **Test Email Functionality**
- Register a new user → Should receive welcome email
- Login → Should receive security notification
- Verify emails arrive within 5-10 seconds

---

## Monitoring Checklist

### Healthy Service Indicators:
- ✅ `/health` returns 200 with `"connected": true`
- ✅ Health check runs every 5 minutes successfully
- ✅ Keep-alive pings return 200 every 8 minutes
- ✅ No "Connection lost" warnings in logs
- ✅ Emails send successfully
- ✅ Queue message counts stay at 0 (being consumed)

### Warning Signs to Watch For:
- ⚠️ "Health check failed" messages
- ⚠️ "Service degraded (503)" in keep-alive logs
- ⚠️ "Max connection retries reached" errors
- ⚠️ Retry count approaching MAX_RETRIES (5)
- ⚠️ Messages accumulating in RabbitMQ queues

---

## Additional Improvements Made

1. **Better Error Logging**: More descriptive logs for debugging
2. **Retry Count Tracking**: Visible in health endpoint
3. **Last Connection Timestamps**: Shows when connection was last successful
4. **Health Check Interval Cleanup**: Properly cleared on shutdown
5. **Connection Verification**: Not just checking if object exists, but actually testing it works

---

## Configuration

### Environment Variables (No changes needed):
```bash
RABBITMQ_URI=amqps://...
NOTIFICATION_SERVICE_URL=https://rivo-notification.onrender.com
NODE_ENV=production
```

### Timing Configuration:
- **Internal Health Check**: Every 5 minutes
- **External Keep-Alive**: Every 8 minutes  
- **Retry Delay**: 10 seconds between retries
- **Max Retries**: 5 attempts before giving up (temp)
- **RabbitMQ Heartbeat**: 60 seconds

---

## Rollback Plan

If issues occur, revert with:
```bash
git revert HEAD
git push origin main
```

The old code will restore, but the 503 issue will return.

---

## Future Enhancements (Optional)

1. **Exponential Backoff**: Increase delay between retries
2. **CloudAMQP Webhook**: Get notified of connection issues
3. **External Monitoring**: UptimeRobot or similar to ping from outside
4. **Metrics Dashboard**: Track connection uptime, retry counts, email sent rate
5. **Alert System**: Send notifications when service degrades

---

## Comparison: Before vs After

| Aspect | Before ❌ | After ✅ |
|--------|----------|---------|
| **Health Monitoring** | Only when pinged | Every 5 minutes automatic |
| **Connection Verification** | Just checked if object exists | Actually tests with checkQueue() |
| **503 Response** | Logged and ignored | Triggers automatic reconnection |
| **Retry Limit** | 3 attempts, then gave up forever | 5 attempts, reset on health checks |
| **Keep-Alive Frequency** | Every 10 minutes | Every 8 minutes |
| **Self-Healing** | None | Automatic via health checks |
| **Manual Recovery** | Had to redeploy service | POST /reconnect endpoint |
| **Connection Freshness** | Could go stale | Kept fresh with periodic checks |

---

## Success Metrics

After 24 hours of deployment, you should see:
- ✅ Zero 503 errors from keep-alive
- ✅ 100% uptime on `/health` endpoint
- ✅ All emails delivered successfully
- ✅ No manual interventions needed
- ✅ Consistent RabbitMQ connection
- ✅ Health check passing every 5 minutes

---

## Troubleshooting

### If 503 Still Occurs:
1. Check Render logs for "Health check failed" messages
2. Verify RABBITMQ_URI is set correctly in Render
3. Check CloudAMQP dashboard for connection limits
4. Manually trigger `/reconnect` endpoint
5. Check if CloudAMQP service is down

### If Reconnection Fails:
1. Check retry count in logs - if at 5, that's expected
2. Wait for health check to reset retry count
3. Check CloudAMQP firewall settings
4. Verify RabbitMQ credentials haven't expired
5. Check Render service for restart loops

---

## Related Documentation
- `NOTIFICATION_SERVICE_TROUBLESHOOTING.md` - General troubleshooting
- `RABBITMQ_CONNECTION_ISSUE_EXPLAINED.md` - RabbitMQ connection details
- `RABBITMQ_FIX.md` - Previous RabbitMQ fixes

---

**Last Updated**: November 22, 2025  
**Status**: Deployed and monitoring  
**Next Review**: After 24 hours of production use
