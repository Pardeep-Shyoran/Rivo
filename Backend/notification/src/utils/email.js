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
  });

  transporter.verify((error) => {
    if (error) {
      console.error('[email] Error verifying transporter:', error.message || error);
    } else {
      console.log('[email] Transporter verified. Ready to send messages');
    }
  });

  return transporter;
}

// Function to send email
export default async function sendEmail(to, subject, text, html) {
  try {
    const tx = buildTransporter();
    if (!tx) {
      console.error('[email] Cannot send email: transporter not configured');
      return;
    }

    const info = await tx.sendMail({
      from: `"Rivo" <${config.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('[email] Message sent:', info.messageId);
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log('[email] Preview URL:', preview);
  } catch (error) {
    console.error('[email] Error sending email:', error.message || error);
  }
}