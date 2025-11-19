// email.js
import { google } from "googleapis";
import MailComposer from "nodemailer/lib/mail-composer/index.js"; // builds RFC-2822 message
import config from "../config/config.js"; // ensure this loads env vars securely

/* ===========================
   1) Templates (same as yours)
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
        <hr />
        <p style="font-size:12px;color:#666;">You’re receiving this email for account safety.</p>
      `,
      text: `Profile updated. Fields: ${changed.join(", ")}. Time: ${timestamp}. IP: ${ip}. Device: ${userAgent}.`,
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
      <p>If you did not perform this action, reset your password NOW.</p>
    `,
    text: `Password changed at ${timestamp}. IP: ${ip}. Device: ${userAgent}.`,
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
      <p>If this wasn't you: Please secure your account immediately.</p>
    `,
    text: `New login detected for ${fullName?.firstName || ""} at ${timestamp}. IP: ${ip}.`,
  }),
};

/* ===========================
   2) Helpers
   =========================== */

// Minimal base64url encoder required by Gmail API (RFC 4648 §5)
function base64UrlEncode(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Example hook: persist new refresh token securely (implement for your infra)
async function persistRefreshToken(newRefreshToken) {
  // TODO: replace with secure storage (DB, secret manager)
  // e.g. await secretsClient.set("GMAIL_REFRESH_TOKEN", newRefreshToken);
  console.log("[email] persistRefreshToken called — implement secure persistence.");
}

/* ===========================
   3) Gmail client factory (handles token rotation)
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

  // Listen for token refreshes. Persist rotated refresh token if Google provides one.
  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.refresh_token) {
      // save new refresh token securely
      try {
        await persistRefreshToken(tokens.refresh_token);
        console.log("[email] Persisted new refresh token");
      } catch (err) {
        console.error("[email] Failed to persist refresh token:", err);
      }
    }
    if (tokens.access_token) {
      // access token available (useful for debugging / monitoring)
      console.log("[email] OAuth access token refreshed (expiry_date):", tokens.expiry_date || "unknown");
    }
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
}

/* ===========================
   4) Build RFC-2822 message using MailComposer
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
      attachments, // attachments per nodemailer format if provided
    };

    const composer = new MailComposer(mailOptions);
    composer.compile().build((err, message) => {
      if (err) return reject(err);
      resolve(message); // Buffer (RFC-2822)
    });
  });
}

/* ===========================
   5) sendEmail with retries + backoff
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
  const gmail = getGmailClient();
  const from = `"Rivo - Play for All" <${config.EMAIL_USER}>`;

  // Build the raw RFC-2822 message
  const messageBuffer = await buildRawMessage({ from, to, subject, text, html, cc, bcc, attachments });
  const raw = base64UrlEncode(messageBuffer);

  // retry loop with exponential backoff for transient errors
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw },
      });
      console.log(`[email] Sent messageId=${res.data.id}`);
      return res.data;
    } catch (err) {
      const isRetryable =
        err?.code === 429 || // quota
        (err?.code >= 500 && err?.code < 600) || // server errors
        ["ENOTFOUND", "ETIMEDOUT", "ESOCKET", "ECONNRESET"].includes(err?.code);

      console.error(`[email] Send attempt ${attempt + 1} failed:`, err?.message || err);

      // If not retryable or out of attempts, rethrow
      if (!isRetryable || attempt === maxRetries) {
        // optional: attach API error body for debugging
        if (err?.response?.data) {
          console.error("[email] Gmail API response:", JSON.stringify(err.response.data));
        }
        throw err;
      }

      // Exponential backoff
      const wait = retryDelayMs * Math.pow(2, attempt);
      console.log(`[email] retrying in ${wait}ms...`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}
