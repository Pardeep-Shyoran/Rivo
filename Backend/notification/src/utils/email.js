// email.js
import { google } from "googleapis";
import MailComposer from "nodemailer/lib/mail-composer/index.js"; 
import config from "../config/config.js"; 

/* ===========================
   1) Templates
   =========================== */
export const templates = {
  profileUpdated: ({ changed, timestamp, ip, userAgent }) => {
    const list = changed.map((f) => `<li>${f}</li>`).join("");
    return {
      subject: "Security Alert: Your Profile Was Updated",
      html: `
        <h2>Profile Changes Detected</h2>
        <p>The following fields on your Rivo profile were updated:</p>
        <ul>${list}</ul>
        <p><strong>Time:</strong> ${timestamp}<br/>
        <strong>IP:</strong> ${ip || "unknown"}<br/>
        <strong>Device:</strong> ${userAgent || "unknown"}</p>
        <p>If this wasn’t you, please reset your password immediately and contact support.</p>
      `,
      text: `Profile updated. Fields: ${changed.join(", ")}. Time: ${timestamp}.`,
    };
  },
  passwordChanged: ({ timestamp, ip, userAgent }) => ({
    subject: "Security Alert: Password Changed",
    html: `
      <h2>Your Password Was Changed</h2>
      <p>Your Rivo account password was successfully changed.</p>
      <p><strong>Time:</strong> ${timestamp}<br/>
      <strong>IP:</strong> ${ip || "unknown"}<br/>
      <strong>Device:</strong> ${userAgent || "unknown"}</p>
    `,
    text: `Password changed at ${timestamp}. IP: ${ip}.`,
  }),
  profilePhotoUpdated: ({ timestamp, ip, userAgent }) => ({
    subject: "Security Alert: Profile Photo Updated",
    html: `
      <h2>Your Profile Photo Was Changed</h2>
      <p>Your Rivo account profile picture was updated successfully.</p>
      <p><strong>Time:</strong> ${timestamp}<br/>
      <strong>IP:</strong> ${ip || "unknown"}<br/>
      <strong>Device:</strong> ${userAgent || "unknown"}</p>
    `,
    text: `Profile photo updated at ${timestamp}.`,
  }),
  profilePhotoDeleted: ({ timestamp, ip, userAgent }) => ({
    subject: "Security Alert: Profile Photo Removed",
    html: `
      <h2>Your Profile Photo Was Removed</h2>
      <p>Your Rivo account profile picture was removed.</p>
      <p><strong>Time:</strong> ${timestamp}<br/>
      <strong>IP:</strong> ${ip || "unknown"}<br/>
      <strong>Device:</strong> ${userAgent || "unknown"}</p>
    `,
    text: `Profile photo removed at ${timestamp}.`,
  }),
  userLoggedIn: ({ fullName, timestamp, ip, userAgent }) => ({
    subject: "Security Alert: New Login Detected",
    html: `
      <h2>Welcome Back, ${fullName?.firstName || ""}!</h2>
      <p>A new login to your Rivo account was detected.</p>
      <p><strong>Time:</strong> ${timestamp || new Date().toLocaleString()}<br/>
      <strong>IP Address:</strong> ${ip || "unknown"}<br/>
      <strong>Device:</strong> ${userAgent || "unknown"}</p>
    `,
    text: `New login detected for ${fullName?.firstName || ""} at ${timestamp}.`,
  }),
};

/* ===========================
   2) Helpers
   =========================== */

function base64UrlEncode(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Placeholder: Implement DB storage here
async function persistRefreshToken(newRefreshToken) {
  console.log("[email] persistRefreshToken called — TODO: Save this token to DB securely.");
}

/* ===========================
   3) Gmail client factory
   =========================== */

function getGmailClient() {
  const required = ["CLIENT_ID", "CLIENT_SECRET", "REFRESH_TOKEN", "EMAIL_USER"];
  const missing = required.filter((k) => !config[k]);
  if (missing.length) {
    throw new Error(`Missing email config vars: ${missing.join(", ")}`);
  }

  const oauth2Client = new google.auth.OAuth2(
    config.CLIENT_ID,
    config.CLIENT_SECRET,
    config.REDIRECT_URI || "urn:ietf:wg:oauth:2.0:oob"
  );

  oauth2Client.setCredentials({ refresh_token: config.REFRESH_TOKEN });

  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.refresh_token) {
      try {
        await persistRefreshToken(tokens.refresh_token);
        console.log("[email] Persisted new refresh token");
      } catch (err) {
        console.error("[email] Failed to persist refresh token:", err);
      }
    }
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
}

/* ===========================
   4) Build RFC-2822 message
   =========================== */

function buildRawMessage({ from, to, subject, text, html, cc, bcc, attachments }) {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from,
      to,
      subject,
      text,
      html,
      cc,
      bcc,
      attachments,
    };

    const composer = new MailComposer(mailOptions);
    composer.compile().build((err, message) => {
      if (err) return reject(err);
      resolve(message); 
    });
  });
}

/* ===========================
   5) sendEmail (FIXED)
   =========================== */

export async function sendEmail({
  to,
  subject,
  text,
  html,
  cc,
  bcc,
  attachments,
  maxRetries = 3,
  retryDelayMs = 1000,
}) {
  // --- FIX START: Explicit Validation ---
  if (!to || (Array.isArray(to) && to.length === 0)) {
    const error = new Error("[email] 'to' argument is missing or empty.");
    console.error(error.message);
    throw error;
  }
  // --- FIX END ---

  console.log(`[email] Attempting to send email to: ${to}`);

  const gmail = getGmailClient();
  const from = `"Rivo - Play for All" <${config.EMAIL_USER}>`;

  // Build the raw RFC-2822 message
  const messageBuffer = await buildRawMessage({ from, to, subject, text, html, cc, bcc, attachments });
  const raw = base64UrlEncode(messageBuffer);

  // Retry loop
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw },
      });
      console.log(`[email] Success! MessageId=${res.data.id}`);
      return res.data;
    } catch (err) {
      const isRetryable =
        err?.code === 429 || 
        (err?.code >= 500 && err?.code < 600) || 
        ["ENOTFOUND", "ETIMEDOUT", "ESOCKET", "ECONNRESET"].includes(err?.code);

      console.error(`[email] Attempt ${attempt + 1} failed: ${err?.message || err}`);

      if (!isRetryable || attempt === maxRetries) {
        if (err?.response?.data) {
          // Log Google's specific error reason
          console.error("[email] API Error Details:", JSON.stringify(err.response.data, null, 2));
        }
        throw err;
      }

      const wait = retryDelayMs * Math.pow(2, attempt);
      console.log(`[email] Retrying in ${wait}ms...`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}