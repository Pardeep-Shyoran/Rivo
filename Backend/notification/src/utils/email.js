// email.js
import { google } from "googleapis";
import MailComposer from "nodemailer/lib/mail-composer/index.js";
import { UAParser } from "ua-parser-js";
import config from "../config/config.js";

/* ===========================
   1) Helpers (NEW + Updated)
   =========================== */

// Generate IST timestamp
export function getISTTimestamp() {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
  });
}

// Parse device details from User-Agent
export function parseDevice(uaString) {
  if (!uaString) return "Unknown Device";

  const parser = new UAParser(uaString);
  const device = parser.getDevice();
  const os = parser.getOS();
  const browser = parser.getBrowser();

  let deviceStr = "";

  if (device.vendor || device.model) {
    deviceStr += `${device.vendor || ""} ${device.model || ""}`.trim();
  } else {
    deviceStr += "Device";
  }

  deviceStr += ` / ${os.name || "OS"} / ${browser.name || "Browser"}`;

  return deviceStr;
}

/* ===========================
   2) Templates (unchanged except timestamp/device now reliable)
   =========================== */

export const templates = {
  profileUpdated: ({ changed, timestamp, ip, userAgent }) => {
    const list = changed.map(f => `<li>${f}</li>`).join("");

    return {
      subject: "Security Alert: Your Profile Was Updated",
      html: `
        <h2>Profile Changes Detected</h2>
        <p>The following fields on your Rivo profile were updated:</p>
        <ul>${list}</ul>
        <p><strong>Time:</strong> ${timestamp}<br/>
        <strong>IP:</strong> ${ip}<br/>
        <strong>Device:</strong> ${userAgent}</p>
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
      <strong>IP:</strong> ${ip}<br/>
      <strong>Device:</strong> ${userAgent}</p>
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
      <strong>IP:</strong> ${ip}<br/>
      <strong>Device:</strong> ${userAgent}</p>
    `,
    text: `Profile photo updated at ${timestamp}. IP: ${ip}. Device: ${userAgent}.`,
  }),

  profilePhotoDeleted: ({ timestamp, ip, userAgent }) => ({
    subject: "Security Alert: Profile Photo Removed",
    html: `
      <h2>Your Profile Photo Was Removed</h2>
      <p>Your Rivo account profile picture was removed.</p>
      <p><strong>Time:</strong> ${timestamp}<br/>
      <strong>IP:</strong> ${ip}<br/>
      <strong>Device:</strong> ${userAgent}</p>
    `,
    text: `Profile photo removed at ${timestamp}. IP: ${ip}. Device: ${userAgent}.`,
  }),

  userLoggedIn: ({ fullName, timestamp, ip, userAgent }) => ({
    subject: "Security Alert: New Login Detected",
    html: `
      <h2>Welcome Back, ${fullName?.firstName || ""}!</h2>
      <p>A new login to your Rivo account was detected.</p>
      <p><strong>Time:</strong> ${timestamp}<br/>
      <strong>IP Address:</strong> ${ip}<br/>
      <strong>Device:</strong> ${userAgent}</p>
      <p>If this wasn't you: Please secure your account immediately.</p>
    `,
    text: `New login detected at ${timestamp}. IP: ${ip}. Device: ${userAgent}.`,
  }),
};

/* ===========================
   3) Token persistence hook
   =========================== */

async function persistRefreshToken(newRefreshToken) {
  console.log("[email] persistRefreshToken called — implement secure persistence.");
}

/* ===========================
   4) Gmail Client
   =========================== */

function getGmailClient() {
  const required = ["CLIENT_ID", "CLIENT_SECRET", "REFRESH_TOKEN", "EMAIL_USER"];
  const missing = required.filter(k => !config[k]);
  if (missing.length) throw new Error(`Missing email config vars: ${missing.join(", ")}`);

  const oauth2Client = new google.auth.OAuth2(
    config.CLIENT_ID,
    config.CLIENT_SECRET,
    config.REDIRECT_URI || "urn:ietf:wg:oauth:2.0:oob"
  );

  oauth2Client.setCredentials({ refresh_token: config.REFRESH_TOKEN });

  oauth2Client.on("tokens", async tokens => {
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
   5) Build RFC-2822 message
   =========================== */

function base64UrlEncode(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function buildRawMessage({ from, to, subject, text, html, cc, bcc, attachments }) {
  return new Promise((resolve, reject) => {
    const composer = new MailComposer({
      from,
      to,
      subject,
      text,
      html,
      cc,
      bcc,
      attachments,
    });

    composer.compile().build((err, message) => {
      if (err) return reject(err);
      resolve(message);
    });
  });
}

/* ===========================
   6) sendEmail (retry-safe)
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

  const messageBuffer = await buildRawMessage({ from, to, subject, text, html, cc, bcc, attachments });
  const raw = base64UrlEncode(messageBuffer);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw },
      });

      console.log(`[email] Sent messageId=${res.data.id}`);
      return res.data;
    } catch (err) {
      const retryable =
        err?.code === 429 ||
        (err?.code >= 500 && err?.code < 600) ||
        ["ENOTFOUND", "ETIMEDOUT", "ESOCKET", "ECONNRESET"].includes(err?.code);

      console.error(`[email] Send attempt ${attempt + 1} failed:`, err?.message);

      if (!retryable || attempt === maxRetries) throw err;

      const wait = retryDelayMs * Math.pow(2, attempt);
      console.log(`[email] Retrying in ${wait}ms...`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
}
