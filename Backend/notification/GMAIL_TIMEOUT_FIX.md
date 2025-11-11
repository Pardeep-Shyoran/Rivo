# 🔧 Gmail SMTP Timeout Fix

## ❌ The Problem

Your notification service is working perfectly:
- ✅ Connecting to RabbitMQ
- ✅ Receiving messages
- ✅ Processing messages
- ❌ **Gmail SMTP connection timing out**

**Error:** `[email] Error sending email: Connection timeout`

---

## 🎯 Root Causes

### 1. **Gmail Blocks Cloud Server IPs**
Gmail's security systems often block connections from cloud servers (AWS, Render, Heroku) thinking they're spam/bots.

### 2. **OAuth2 Refresh Token Expired**
Your Gmail OAuth2 refresh token might have expired (they can expire if unused for 6 months or if you change your Google password).

### 3. **Rate Limiting**
Gmail has strict rate limits for SMTP connections from unfamiliar IPs.

---

## ✅ **Solution 1: Use SendGrid (RECOMMENDED)**

SendGrid is designed for transactional emails and works reliably from cloud servers.

### Setup SendGrid:

1. **Sign up for free:** https://sendgrid.com/free/
   - Free tier: 100 emails/day

2. **Create API Key:**
   - SendGrid Dashboard → Settings → API Keys
   - Create API Key with "Mail Send" permission
   - Copy the key (shows only once!)

3. **Update your code:**

**Install SendGrid package:**
```bash
cd Backend/notification
npm install @sendgrid/mail
```

**Create new file:** `Backend/notification/src/utils/email-sendgrid.js`
```javascript
import sgMail from '@sendgrid/mail';
import config from '../config/config.js';

sgMail.setApiKey(config.SENDGRID_API_KEY);

export default async function sendEmail(to, subject, text, html) {
  try {
    const msg = {
      to,
      from: config.EMAIL_USER, // Must be verified in SendGrid
      subject,
      text,
      html,
    };

    await sgMail.send(msg);
    console.log('[email] ✅ Email sent via SendGrid to:', to);
  } catch (error) {
    console.error('[email] ❌ SendGrid error:', error.message);
    if (error.response) {
      console.error('[email] Error details:', error.response.body);
    }
  }
}
```

4. **Add to Render Environment:**
```bash
SENDGRID_API_KEY=your_sendgrid_api_key_here
EMAIL_USER=your-verified@email.com  # Must verify this in SendGrid
```

5. **Update listener.js** to import from `email-sendgrid.js` instead

---

## ✅ **Solution 2: Use AWS SES**

AWS Simple Email Service is highly reliable and cheap.

### Setup AWS SES:

1. **Sign up for AWS:** https://aws.amazon.com/ses/
   - Free tier: 62,000 emails/month (when hosted on AWS)

2. **Verify your sender email:**
   - AWS Console → SES → Verified Identities
   - Add and verify your email address

3. **Get SMTP credentials:**
   - AWS Console → SES → SMTP Settings
   - Create SMTP Credentials
   - Note the server, port, username, and password

4. **Update environment variables on Render:**
```bash
EMAIL_SERVICE=SES
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your_aws_smtp_username
EMAIL_PASSWORD=your_aws_smtp_password
EMAIL_FROM=your-verified@email.com
```

5. **Update email.js:**
```javascript
transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST,
  port: config.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASSWORD,
  },
});
```

---

## ✅ **Solution 3: Fix Gmail OAuth2 (Hard)**

If you really want to use Gmail:

### Step 1: Regenerate OAuth2 Credentials

1. **Go to Google Cloud Console:** https://console.cloud.google.com/
2. **Enable Gmail API** (if not already)
3. **Create OAuth 2.0 Client ID** (Web application type)
4. **Add redirect URI:** `https://developers.google.com/oauthplayground`

### Step 2: Get New Refresh Token

1. **Go to OAuth Playground:** https://developers.google.com/oauthplayground/
2. Click ⚙️ (settings) → Check "Use your own OAuth credentials"
3. Enter your Client ID and Client Secret
4. **Select scope:** `https://mail.google.com/`
5. Click "Authorize APIs"
6. Sign in with your Gmail account
7. Click "Exchange authorization code for tokens"
8. Copy the **Refresh Token**

### Step 3: Update Render Environment Variables

```bash
EMAIL_USER=your-email@gmail.com
CLIENT_ID=your-new-client-id
CLIENT_SECRET=your-new-client-secret
REFRESH_TOKEN=your-new-refresh-token
```

### Step 4: Enable Less Secure Apps (if needed)

⚠️ **Not recommended for security reasons**
- Go to: https://myaccount.google.com/lesssecureapps
- Turn ON "Allow less secure apps"

---

## ✅ **Solution 4: Disable Emails (Quick Fix)**

If you don't need emails right now, just let the service run. It will:
- ✅ Still process messages
- ✅ Still acknowledge messages (so they don't pile up)
- ❌ Just won't send emails

**No code changes needed** - it already handles failures gracefully!

---

## 🧪 **Testing After Fix**

### Test SendGrid/SES:
1. Deploy to Render with new env vars
2. Update user profile in your app
3. Check Render logs for:
   ```
   [email] ✅ Email sent via SendGrid to: user@example.com
   ```
4. Check user's inbox

### Test Gmail:
1. Update OAuth2 credentials on Render
2. Restart service
3. Check logs for:
   ```
   [email] ✅ Gmail transporter verified. Ready to send emails
   ```
4. Trigger a test email

---

## 📊 **Comparison**

| Service | Cost | Setup Difficulty | Reliability | From Cloud |
|---------|------|------------------|-------------|------------|
| **SendGrid** | Free (100/day) | ⭐ Easy | ⭐⭐⭐⭐⭐ Excellent | ✅ Yes |
| **AWS SES** | Free (62k/mo) | ⭐⭐ Medium | ⭐⭐⭐⭐⭐ Excellent | ✅ Yes |
| **Gmail** | Free | ⭐⭐⭐⭐ Hard | ⭐⭐ Poor | ❌ Often blocked |
| **Mailgun** | Free (5k/mo) | ⭐ Easy | ⭐⭐⭐⭐ Good | ✅ Yes |

---

## 🎯 **My Recommendation**

**Use SendGrid:**
1. ✅ Easiest to setup
2. ✅ Works reliably from Render
3. ✅ Free tier is generous
4. ✅ No OAuth2 headaches
5. ✅ Good documentation

**Setup time:** 10 minutes

---

## 🚀 **Quick SendGrid Setup**

```bash
# 1. Install package
cd Backend/notification
npm install @sendgrid/mail

# 2. Get API key from SendGrid
# https://app.sendgrid.com/settings/api_keys

# 3. Add to Render environment:
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
EMAIL_USER=your-verified-email@domain.com

# 4. Verify email in SendGrid:
# https://app.sendgrid.com/settings/sender_auth

# 5. Update config.js to include SENDGRID_API_KEY

# 6. Update listener.js to use email-sendgrid.js

# 7. Deploy!
```

---

## 📝 **Current Status**

Your notification service is **90% working**:
- ✅ Deployed successfully
- ✅ Connecting to RabbitMQ
- ✅ Processing messages
- ❌ Gmail blocking emails

**Fix:** Switch to SendGrid (10 minutes) → 100% working! 🎉

---

**Need help with SendGrid setup? Let me know!**
