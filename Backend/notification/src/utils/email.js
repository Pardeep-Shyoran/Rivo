import nodemailer from 'nodemailer';
import config from '../config/config.js';

// Simple templates for security notifications
export const templates = {
  profileUpdated: ({ changed, timestamp, ip, userAgent }) => {
    const list = changed.map(f => `<li>${f}</li>`).join('');
    return {
      subject: 'Security Alert: Your Profile Was Updated',
      html: `
        <h2>Profile Changes Detected</h2>
        <p>The following fields on your Rivo profile were updated:</p>
        <ul>${list}</ul>
        <p><strong>Time:</strong> ${timestamp}<br/>
        <strong>IP:</strong> ${ip || 'unknown'}<br/>
        <strong>Device:</strong> ${userAgent || 'unknown'}</p>
        <p>If this wasn’t you, please reset your password immediately and contact support.</p>
        <hr />
        <p style="font-size:12px;color:#666;">You’re receiving this email for account safety.</p>
      `,
      text: `Profile updated. Fields: ${changed.join(', ')}. Time: ${timestamp}. IP: ${ip}. Device: ${userAgent}. If not you, reset password.`
    };
  },
  passwordChanged: ({ timestamp, ip, userAgent }) => ({
    subject: 'Security Alert: Password Changed',
    html: `
      <h2>Your Password Was Changed</h2>
      <p>Your Rivo account password was successfully changed.</p>
      <p><strong>Time:</strong> ${timestamp}<br/>
      <strong>IP:</strong> ${ip || 'unknown'}<br/>
      <strong>Device:</strong> ${userAgent || 'unknown'}</p>
      <p>If you did not perform this action, reset your password NOW and contact support.</p>
      <hr />
      <p style="font-size:12px;color:#666;">Automated security notification from Rivo.</p>
    `,
    text: `Password changed at ${timestamp}. IP: ${ip}. Device: ${userAgent}. If not you, reset immediately.`
  }),
  profilePhotoUpdated: ({ timestamp, ip, userAgent }) => ({
    subject: 'Security Alert: Profile Photo Updated',
    html: `
      <h2>Your Profile Photo Was Changed</h2>
      <p>Your Rivo account profile picture was updated successfully.</p>
      <p><strong>Time:</strong> ${timestamp}<br/>
      <strong>IP:</strong> ${ip || 'unknown'}<br/>
      <strong>Device:</strong> ${userAgent || 'unknown'}</p>
      <p>If you did not perform this action, please reset your password and contact support.</p>
      <hr />
      <p style="font-size:12px;color:#666;">Automated security notification from Rivo.</p>
    `,
    text: `Profile photo updated at ${timestamp}. IP: ${ip}. Device: ${userAgent}. If not you, reset password.`
  }),
  profilePhotoDeleted: ({ timestamp, ip, userAgent }) => ({
    subject: 'Security Alert: Profile Photo Removed',
    html: `
      <h2>Your Profile Photo Was Removed</h2>
      <p>Your Rivo account profile picture was removed.</p>
      <p><strong>Time:</strong> ${timestamp}<br/>
      <strong>IP:</strong> ${ip || 'unknown'}<br/>
      <strong>Device:</strong> ${userAgent || 'unknown'}</p>
      <p>If you did not perform this action, please secure your account immediately.</p>
      <hr />
      <p style="font-size:12px;color:#666;">Automated security notification from Rivo.</p>
    `,
    text: `Profile photo removed at ${timestamp}. IP: ${ip}. Device: ${userAgent}. If not you, secure account.`
  }),
  userLoggedIn: ({ fullName, timestamp, ip, userAgent }) => ({
    subject: 'Security Alert: New Login Detected',
    html: `
      <h2>Welcome Back, ${fullName.firstName || ''}!</h2>
      <p>A new login to your Rivo account was detected.</p>
      <p><strong>Time:</strong> ${timestamp || new Date().toLocaleString()}<br/>
      <strong>IP Address:</strong> ${ip || 'unknown'}<br/>
      <strong>Device:</strong> ${userAgent || 'unknown'}</p>
      <p>If this was you, you can safely ignore this email.</p>
      <p><strong>If this wasn't you:</strong> Please secure your account immediately by changing your password and reviewing your account activity.</p>
      <hr />
      <p style="font-size:12px;color:#666;">You're receiving this email for account security. This is an automated notification from Rivo.</p>
    `,
    text: `New login detected for ${fullName.firstName || ''} ${fullName.lastName || ''} at ${timestamp || new Date().toLocaleString()}. IP: ${ip || 'unknown'}. Device: ${userAgent || 'unknown'}. If not you, secure your account immediately.`
  }),
};

// Lazy singleton so startup doesn't fail if Gmail creds missing (service can still run & log)
let transporter;

function buildTransporter() {
  if (transporter) return transporter;

  const missing = ['EMAIL_USER','CLIENT_ID','CLIENT_SECRET','REFRESH_TOKEN']
    .filter((k) => !config[k]);
  if (missing.length) {
    console.warn('[email] Missing env vars for Gmail OAuth2:', missing.join(', '));
    console.warn('[email] Emails will NOT be sent until all are provided.');
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: config.EMAIL_USER,
      clientId: config.CLIENT_ID,
      clientSecret: config.CLIENT_SECRET,
      refreshToken: config.REFRESH_TOKEN,
    },
    // Add timeouts and retry configuration
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000,    // 5 seconds
    socketTimeout: 15000,     // 15 seconds
    pool: true,               // Use pooled connections
    maxConnections: 5,        // Max concurrent connections
    maxMessages: 100,         // Max messages per connection
    rateDelta: 1000,          // Rate limiting (1 second between messages)
    rateLimit: 5,             // Max 5 messages per rateDelta
  });

  // Verify with timeout
  const verifyPromise = transporter.verify();
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Verification timeout')), 10000)
  );
  
  Promise.race([verifyPromise, timeoutPromise])
    .then(() => {
      console.log('[email] ✅ Gmail transporter verified. Ready to send emails');
    })
    .catch((error) => {
      console.error('[email] ⚠️  Transporter verification failed:', error.message);
      console.error('[email] Possible issues:');
      console.error('  - Gmail OAuth2 credentials expired or invalid');
      console.error('  - Gmail blocking connections from this IP');
      console.error('  - Network connectivity issues');
      console.error('[email] Emails may fail to send. Check your Gmail OAuth2 setup.');
    });

  return transporter;
}

// Reuse the same transporter for all emails
let globalTransporter = null;

// Function to send email with retry logic
export default async function sendEmail(to, subject, text, html, retries = 2) {
  try {
    // Build transporter once and reuse
    if (!globalTransporter) {
      globalTransporter = buildTransporter();
    }
    
    const tx = globalTransporter;
    if (!tx) {
      console.error('[email] ❌ Cannot send email: transporter not configured');
      return;
    }

    console.log(`[email] 📤 Attempting to send email to: ${to}`);

    const info = await tx.sendMail({
      from: `"Rivo" <${config.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('[email] ✅ Email sent successfully:', info.messageId);
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log('[email] Preview URL:', preview);
  } catch (error) {
    console.error('[email] ❌ Error sending email:', error);
    
    // Log specific error types
    if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET') {
      console.error('[email] 🔌 Connection timeout - Gmail may be blocking this IP');
      console.error('[email] 💡 Solutions:');
      console.error('  1. Verify Gmail OAuth2 credentials are correct');
      console.error('  2. Check if refresh token is expired');
      console.error('  3. Consider using SendGrid, AWS SES, or Mailgun instead');
    } else if (error.code === 'EAUTH') {
      console.error('[email] 🔐 Authentication failed - Check OAuth2 credentials');
    }
    
    // Retry logic
    if (retries > 0 && (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET')) {
      console.log(`[email] 🔄 Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      return sendEmail(to, subject, text, html, retries - 1);
    }
  }
}