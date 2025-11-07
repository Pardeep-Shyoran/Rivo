import nodemailer from 'nodemailer';
import config from '../config/config.js';

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