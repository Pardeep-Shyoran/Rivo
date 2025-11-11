# 🚨 Notification Service Troubleshooting Guide

## Problem: Emails Not Sending on Render (But Work Locally)

### Root Cause
The notification service on Render is **NOT connecting to RabbitMQ**, even though the auth service is successfully publishing messages to the queue.

---

## ✅ Solution Checklist

### 1. **Verify Environment Variables on Render**

Go to your Render dashboard → Notification Service → Environment tab and ensure these are set:

```bash
RABBITMQ_URI=amqps://slpgqngp:uZaHeag5MeSLXcV9uimf0CNO0NUzlDtW@leopard.lmq.cloudamqp.com/slpgqngp
EMAIL_USER=your-email@gmail.com
CLIENT_ID=your-oauth-client-id
CLIENT_SECRET=your-oauth-client-secret
REFRESH_TOKEN=your-oauth-refresh-token
PORT=3002
```

⚠️ **Most Common Issue**: `RABBITMQ_URI` is missing or incorrect on Render

---

### 2. **Check Logs on Render**

Look for these messages in your Render logs:

#### ✅ **Good Signs (Working)**
```
🚀 Starting Notification Service...
🔌 Connecting to RabbitMQ...
📍 RabbitMQ Host: leopard.lmq.cloudamqp.com
✅ Connected to RabbitMQ successfully!
👂 Email listeners activated
👂 Listening to queue: user_created
👂 Listening to queue: user_logged_in
...
```

#### ❌ **Bad Signs (Not Working)**
```
❌ CRITICAL ERROR: Missing required environment variables:
   - RABBITMQ_URI
```
Or:
```
❌ Failed to connect to RabbitMQ
Error details: { message: 'RABBITMQ_URI environment variable is not set' }
```
Or:
```
🚨 CRITICAL: Max connection retries reached. Notification service will NOT send emails!
```

---

### 3. **Test Health Check Endpoint**

Once deployed, visit:
```
https://your-notification-service.onrender.com/health
```

#### ✅ **Healthy Response (200)**
```json
{
  "status": "ok",
  "service": "notification-service",
  "rabbitmq": {
    "connected": true,
    "isConnecting": false,
    "retryCount": 0,
    "lastSuccessfulConnection": "2025-11-11T10:30:00.000Z"
  },
  "timestamp": "2025-11-11T10:30:00.000Z"
}
```

#### ❌ **Unhealthy Response (503)**
```json
{
  "status": "degraded",
  "service": "notification-service",
  "rabbitmq": {
    "connected": false,
    "isConnecting": false,
    "retryCount": 3,
    "lastConnectionAttempt": "2025-11-11T10:29:45.000Z",
    "lastSuccessfulConnection": null
  }
}
```

---

### 4. **Check Detailed Status**

Visit:
```
https://your-notification-service.onrender.com/status
```

This shows:
- RabbitMQ connection status
- Environment variable presence (without exposing values)
- Memory usage
- Service uptime

```json
{
  "service": "notification-service",
  "uptime": 123.45,
  "rabbitmq": {
    "connected": true,
    "isConnecting": false,
    "retryCount": 0
  },
  "environment": {
    "NODE_ENV": "production",
    "hasRabbitMqUri": true,  ← Should be true!
    "hasEmailUser": true      ← Should be true!
  }
}
```

---

## 🔧 Common Issues & Fixes

### Issue 1: Missing RABBITMQ_URI on Render
**Symptom**: `hasRabbitMqUri: false` in /status endpoint

**Fix**:
1. Go to Render Dashboard
2. Select your notification service
3. Go to Environment tab
4. Add environment variable:
   - Key: `RABBITMQ_URI`
   - Value: `amqps://slpgqngp:uZaHeag5MeSLXcV9uimf0CNO0NUzlDtW@leopard.lmq.cloudamqp.com/slpgqngp`
5. Click "Save Changes"
6. Render will automatically redeploy

---

### Issue 2: CloudAMQP Connection Limit Reached
**Symptom**: Error message contains "connection refused" or "ACCESS_REFUSED"

**Fix**:
1. Go to CloudAMQP dashboard
2. Check "Connections" tab
3. If you see many connections from "auth-service", close some
4. Check if your free tier limit (5-10 connections) is exceeded
5. Consider upgrading CloudAMQP plan or implementing connection pooling

---

### Issue 3: Network/Firewall Issues
**Symptom**: Connection timeout errors

**Fix**:
1. Ensure Render can access CloudAMQP (usually works by default)
2. Check CloudAMQP firewall settings (should allow all IPs or Render's IP range)
3. Try pinging the RabbitMQ host from Render logs

---

### Issue 4: Wrong RabbitMQ URI Format
**Symptom**: Connection fails immediately

**Fix**: Ensure URI format is correct:
```
amqps://username:password@host/vhost
```

Not:
```
amqp://...   (missing 's' for SSL)
http://...   (wrong protocol)
```

---

## 🧪 Testing the Fix

### Test 1: Local Test
```bash
cd Backend/notification
npm install
node server.js
```

You should see:
```
✅ Connected to RabbitMQ successfully!
👂 Email listeners activated
```

### Test 2: Register a New User
1. Register a new user on your frontend
2. Check auth service logs - should see: `Message sent to Queue user_created`
3. Check notification service logs - should see:
   ```
   📨 Received message from 'user_created': user@email.com
   ✅ Message processed successfully from 'user_created'
   ```
4. Check email inbox for welcome email

### Test 3: Login Test
1. Login with existing user
2. Should receive "New login detected" email
3. Check notification logs for processing confirmation

---

## 📊 Message Flow Verification

```
User Action (Frontend)
    ↓
Auth Service receives request
    ↓
Auth Service publishes to RabbitMQ queue ✅ (This is working)
    ↓
RabbitMQ stores message
    ↓
Notification Service consumes message ❌ (This was failing)
    ↓
Notification Service sends email ❌ (Not reached)
```

---

## 🔍 Debug Commands

### Check RabbitMQ Queue Status (CloudAMQP Dashboard)
1. Login to CloudAMQP
2. Go to "RabbitMQ Management"
3. Click "Queues" tab
4. Look for queues: `user_created`, `user_logged_in`, etc.
5. Check "Messages" count - if increasing, notification service isn't consuming

### View Queue Messages
If messages are accumulating:
- Notification service is NOT connected
- Fix the connection issue first
- Messages will be processed once service connects

---

## 🚀 Deployment Steps After Fix

1. **Update Environment Variables on Render**
   - Add all missing variables
   - Save changes

2. **Monitor Deployment Logs**
   - Look for "✅ Connected to RabbitMQ successfully!"
   - Verify all listeners are registered

3. **Test Health Check**
   - Visit `/health` endpoint
   - Ensure `"connected": true`

4. **Test Real Email**
   - Register a new test user
   - Should receive welcome email within seconds

5. **Monitor for 24 Hours**
   - Check if connection stays stable
   - Watch for reconnection attempts
   - Monitor email delivery rate

---

## 💡 Prevention Tips

1. **Always set environment variables BEFORE deploying**
2. **Use Render's Environment Groups** for shared variables
3. **Add health checks to your monitoring** (UptimeRobot, etc.)
4. **Set up alerts** for 503 responses from `/health`
5. **Document all required env vars** in README
6. **Test locally with production values** before deploying

---

## 📞 Still Not Working?

1. Check CloudAMQP status page for outages
2. Verify your CloudAMQP plan hasn't expired
3. Check Render service logs for any crash/restart loops
4. Ensure no firewall blocking port 5671/5672
5. Try recreating the Render service from scratch

---

## ✅ Success Indicators

- ✅ `/health` returns status 200 with `"connected": true`
- ✅ Logs show "Connected to RabbitMQ successfully"
- ✅ All 6 queues show active listeners
- ✅ Registration triggers welcome email within 5 seconds
- ✅ Login triggers security notification email
- ✅ No error messages in logs
- ✅ Queue message counts stay at 0 (being consumed)

---

Last Updated: November 11, 2025
