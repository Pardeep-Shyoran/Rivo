# 🚀 Render Deployment Checklist - Notification Service

## ✅ Environment Variables to Add

Go to: **Render Dashboard** → **Notification Service** → **Environment**

Add these variables:

```bash
# RabbitMQ Connection (CRITICAL!)
RABBITMQ_URI=amqps://slpgqngp:uZaHeag5MeSLXcV9uimf0CNO0NUzlDtW@leopard.lmq.cloudamqp.com/slpgqngp

# Gmail OAuth Configuration
EMAIL_USER=your-email@gmail.com
CLIENT_ID=your-gmail-oauth-client-id
CLIENT_SECRET=your-gmail-oauth-client-secret
REFRESH_TOKEN=your-gmail-oauth-refresh-token

# Server Configuration
PORT=10000
NODE_ENV=production
```

## 📝 After Adding Variables

1. **Click "Save Changes"** - Render will auto-redeploy
2. **Wait 2-3 minutes** for deployment to complete
3. **Check the logs** for these messages:
   ```
   🚀 Starting Notification Service...
   🔌 Connecting to RabbitMQ...
   📍 RabbitMQ Host: leopard.lmq.cloudamqp.com
   ✅ Connected to RabbitMQ successfully!
   👂 Email listeners activated
   👂 Listening to queue: user_created
   👂 Listening to queue: user_logged_in
   ```

## 🧪 Test the Deployment

### 1. Check Health Endpoint
Visit: `https://your-notification-service.onrender.com/health`

**Expected Response (200):**
```json
{
  "status": "ok",
  "service": "notification-service",
  "rabbitmq": {
    "connected": true,
    "isConnecting": false,
    "retryCount": 0
  },
  "timestamp": "2025-11-11T..."
}
```

### 2. Check Status Endpoint
Visit: `https://your-notification-service.onrender.com/status`

**Expected Response (200):**
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
    "hasRabbitMqUri": true,    ← Should be true!
    "hasEmailUser": true        ← Should be true!
  }
}
```

### 3. Test Email Delivery
1. Go to your frontend
2. Register a new test user
3. Check email inbox for welcome email
4. Should arrive within 5-10 seconds

## ❌ If Health Check Shows Problems

### Scenario 1: `"connected": false`
**Cause:** RABBITMQ_URI missing or incorrect

**Fix:**
1. Double-check RABBITMQ_URI in Render environment
2. Make sure no extra spaces
3. Verify it starts with `amqps://` (with 's')
4. Click "Restart Service" in Render

### Scenario 2: `"hasRabbitMqUri": false`
**Cause:** Variable not set in Render

**Fix:**
1. Go to Environment tab in Render
2. Add RABBITMQ_URI variable
3. Save Changes
4. Wait for redeploy

### Scenario 3: `"hasEmailUser": false`
**Cause:** Email OAuth variables missing

**Fix:**
1. Add EMAIL_USER, CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN
2. Save Changes
3. Wait for redeploy

## 🔍 Debugging Steps

### View Logs on Render
1. Go to your service on Render
2. Click "Logs" tab
3. Look for connection messages

### Good Signs ✅
```
✅ Connected to RabbitMQ successfully!
📬 Notification service is ready to receive messages
✅ All message listeners registered successfully
```

### Bad Signs ❌
```
❌ CRITICAL ERROR: Missing required environment variables
❌ Failed to connect to RabbitMQ
🚨 CRITICAL: Max connection retries reached
```

## 📊 Monitoring

After deployment, monitor these metrics:

1. **Service Status**: Should stay "Live"
2. **Response Time**: Health endpoint should respond < 500ms
3. **Error Rate**: Should be 0% after initial deploy
4. **Queue Messages**: Should process and clear quickly

## 🎯 Success Criteria

- [x] All environment variables added
- [ ] Deployment completed successfully
- [ ] Health endpoint returns `"connected": true`
- [ ] Status endpoint shows `hasRabbitMqUri: true`
- [ ] Auth service can publish messages
- [ ] Notification service consumes messages
- [ ] Emails are delivered to inbox
- [ ] No errors in logs

## 🆘 If Still Not Working

1. Check CloudAMQP dashboard for connection issues
2. Verify CloudAMQP plan hasn't expired
3. Check if CloudAMQP connection limit is reached (40 connections for free tier)
4. Try restarting the service (not redeploying)
5. Check Render service logs for crash/restart loops
6. Verify no typos in environment variable values

## 📞 Quick Reference

| What | Where |
|------|-------|
| Add env vars | Render Dashboard → Service → Environment |
| View logs | Render Dashboard → Service → Logs |
| Health check | `https://your-service.onrender.com/health` |
| Status check | `https://your-service.onrender.com/status` |
| Restart service | Render Dashboard → Service → Manual Deploy |

---

**After setting all environment variables, your notification service should work perfectly!** 🎉

The code changes we made will now show much clearer error messages if anything goes wrong, making debugging much easier.
