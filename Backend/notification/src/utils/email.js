import { google } from "googleapis";
import MailComposer from "nodemailer/lib/mail-composer/index.js";
import { UAParser } from "ua-parser-js"; // 1. Import the parser
import config from "../config/config.js";

// ==========================================
// HELPER FUNCTIONS (Time & Device Parsing)
// ==========================================

/**
 * 1. Get Current Time in India (IST)
 * Returns format: "19 Nov, 2025 at 11:30 PM"
 */
const getISTTime = () => {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * 2. Parse User Agent String into Readable Text
 * Input: "Mozilla/5.0 (Windows NT 10.0...)"
 * Output: "Chrome on Windows 10"
 */
const getDeviceDetails = (userAgentString) => {
  if (!userAgentString) return "Unknown Device";
  
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();
  
  const browser = result.browser.name ? `${result.browser.name}` : "";
  const os = result.os.name ? `${result.os.name} ${result.os.version || ""}` : "";
  const device = result.device.model ? `${result.device.vendor} ${result.device.model}` : "";

  // Join parts. Example: "Chrome" + "Windows 10" -> "Chrome on Windows 10"
  const parts = [browser, os, device].filter(Boolean);
  return parts.length > 0 ? parts.join(" on ") : "Unknown Device";
};

// ==========================================
// TEMPLATES
// ==========================================
export const templates = {
  profileUpdated: ({ changed, ip, userAgent }) => {
    const list = changed.map((f) => `<li>${f}</li>`).join("");
    const time = getISTTime();
    const deviceName = getDeviceDetails(userAgent); // Parse the raw string

    return {
      subject: "Security Alert: Your Profile Was Updated",
      html: `
        <h2>Profile Changes Detected</h2>
        <p>The following fields on your Rivo profile were updated:</p>
        <ul>${list}</ul>
        <div style="background:#f4f4f4; padding:10px; border-radius:5px;">
            <p><strong>Time (IST):</strong> ${time}</p>
            <p><strong>IP Address:</strong> ${ip || "Unknown"}</p>
            <p><strong>Device:</strong> ${deviceName}</p>
        </div>
        <p>If this wasn’t you, please reset your password immediately.</p>
      `,
      text: `Profile updated. Time: ${time}. IP: ${ip}. Device: ${deviceName}.`,
    };
  },

  passwordChanged: ({ ip, userAgent }) => {
    const time = getISTTime();
    const deviceName = getDeviceDetails(userAgent);

    return {
      subject: "Security Alert: Password Changed",
      html: `
        <h2>Your Password Was Changed</h2>
        <p>Your Rivo account password was successfully changed.</p>
        <div style="background:#f4f4f4; padding:10px; border-radius:5px;">
            <p><strong>Time (IST):</strong> ${time}</p>
            <p><strong>IP Address:</strong> ${ip || "Unknown"}</p>
            <p><strong>Device:</strong> ${deviceName}</p>
        </div>
        <p>If you did not do this, reset your password NOW.</p>
      `,
      text: `Password changed at ${time}. IP: ${ip}. Device: ${deviceName}.`,
    };
  },

  profilePhotoUpdated: ({ ip, userAgent }) => {
    const time = getISTTime();
    const deviceName = getDeviceDetails(userAgent);

    return {
      subject: "Security Alert: Profile Photo Updated",
      html: `
        <h2>Your Profile Photo Was Changed</h2>
        <p>Your Rivo account profile picture was updated successfully.</p>
        <div style="background:#f4f4f4; padding:10px; border-radius:5px;">
            <p><strong>Time (IST):</strong> ${time}</p>
            <p><strong>IP Address:</strong> ${ip || "Unknown"}</p>
            <p><strong>Device:</strong> ${deviceName}</p>
        </div>
      `,
      text: `Profile photo updated at ${time}. Device: ${deviceName}.`,
    };
  },

  profilePhotoDeleted: ({ ip, userAgent }) => {
    const time = getISTTime();
    const deviceName = getDeviceDetails(userAgent);

    return {
      subject: "Security Alert: Profile Photo Removed",
      html: `
        <h2>Your Profile Photo Was Removed</h2>
        <p>Your Rivo account profile picture was removed.</p>
        <div style="background:#f4f4f4; padding:10px; border-radius:5px;">
            <p><strong>Time (IST):</strong> ${time}</p>
            <p><strong>IP Address:</strong> ${ip || "Unknown"}</p>
            <p><strong>Device:</strong> ${deviceName}</p>
        </div>
      `,
      text: `Profile photo removed at ${time}. Device: ${deviceName}.`,
    };
  },

  userLoggedIn: ({ fullName, ip, userAgent }) => {
    const time = getISTTime();
    const deviceName = getDeviceDetails(userAgent);

    return {
      subject: "Security Alert: New Login Detected",
      html: `
        <h2>Welcome Back, ${fullName.firstName || ""}!</h2>
        <p>A new login to your Rivo account was detected.</p>
        <div style="background:#f4f4f4; padding:10px; border-radius:5px;">
            <p><strong>Time (IST):</strong> ${time}</p>
            <p><strong>IP Address:</strong> ${ip || "Unknown"}</p>
            <p><strong>Device:</strong> ${deviceName}</p>
        </div>
        <p>If this wasn't you: Please secure your account immediately.</p>
      `,
      text: `New login detected for ${fullName.firstName || ""} at ${time}. IP: ${ip}. Device: ${deviceName}.`,
    };
  },
};

// ==========================================
// GMAIL CLIENT & SENDER (Singleton)
// ==========================================

let oauth2ClientInstance = null;

const getGmailClient = () => {
  const required = ["CLIENT_ID", "CLIENT_SECRET", "REFRESH_TOKEN", "EMAIL_USER"];
  const missing = required.filter((k) => !config[k]);
  if (missing.length) {
    throw new Error(`Missing config: ${missing.join(", ")}`);
  }

  if (!oauth2ClientInstance) {
    oauth2ClientInstance = new google.auth.OAuth2(
      config.CLIENT_ID,
      config.CLIENT_SECRET,
      config.REDIRECT_URI
    );
    oauth2ClientInstance.setCredentials({ refresh_token: config.REFRESH_TOKEN });
  }

  return google.gmail({ version: "v1", auth: oauth2ClientInstance });
};

export default async function sendEmail(to, subject, text, html) {
  const gmail = getGmailClient();
  const mailOptions = {
    from: `"Rivo App" <${config.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  const composer = new MailComposer(mailOptions);
  const message = await new Promise((resolve, reject) => {
    composer.compile().build((err, msg) => {
      if (err) reject(err);
      else resolve(msg);
    });
  });

  const raw = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  try {
    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });
    console.log(`[email] Sent! ID: ${res.data.id}`);
    return res.data;
  } catch (err) {
    console.error("[email] Failed to send:", err);
    throw err;
  }
}