import { google } from "googleapis";
import MailComposer from "nodemailer/lib/mail-composer/index.js";
import { UAParser } from "ua-parser-js"; // Import the parser
import config from "../config/config.js";

// ==========================================
// 1. UTILITIES (Time & Device Parsing)
// ==========================================

/**
 * Returns the current time in Indian Standard Time (IST)
 * Format: "19 Nov, 2025 at 11:30 PM"
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
 * Parses the raw User-Agent string into readable Device/OS/Browser
 */
const getDeviceDetails = (userAgentString) => {
  if (!userAgentString) return "Unknown Device";
  
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();
  
  const browser = result.browser.name ? `${result.browser.name}` : "";
  const os = result.os.name ? `${result.os.name} ${result.os.version || ""}` : "";
  const device = result.device.model ? `${result.device.vendor} ${result.device.model}` : "";

  // Construct a readable string (e.g., "Chrome on Windows 10" or "Safari on iPhone")
  const parts = [browser, os, device].filter(Boolean);
  return parts.length > 0 ? parts.join(" on ") : "Unknown Device";
};

// ==========================================
// 2. TEMPLATES
// ==========================================
export const templates = {
  profileUpdated: ({ changed, ip, userAgent }) => {
    const list = changed.map((f) => `<li style="margin-bottom: 5px;">${f}</li>`).join("");
    const deviceName = getDeviceDetails(userAgent);
    const timeIST = getISTTime();

    return {
      subject: "Security Alert: Your Profile Was Updated",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #2c3e50;">Profile Changes Detected</h2>
          <p>The following fields on your Rivo profile were updated:</p>
          <ul>${list}</ul>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff;">
            <p style="margin: 5px 0;"><strong>📅 Time:</strong> ${timeIST} (IST)</p>
            <p style="margin: 5px 0;"><strong>🌐 IP Address:</strong> ${ip || "Unknown"}</p>
            <p style="margin: 5px 0;"><strong>💻 Device:</strong> ${deviceName}</p>
          </div>

          <p>If this wasn’t you, please reset your password immediately and contact support.</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p style="font-size:12px;color:#666;">You’re receiving this email for account safety.</p>
        </div>
      `,
      text: `Profile updated. Fields: ${changed.join(", ")}. Time: ${timeIST}. IP: ${ip}. Device: ${deviceName}.`,
    };
  },

  passwordChanged: ({ ip, userAgent }) => {
    const deviceName = getDeviceDetails(userAgent);
    const timeIST = getISTTime();
    
    return {
      subject: "Security Alert: Password Changed",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #d9534f;">Your Password Was Changed</h2>
          <p>Your Rivo account password was successfully changed.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #d9534f;">
            <p style="margin: 5px 0;"><strong>📅 Time:</strong> ${timeIST} (IST)</p>
            <p style="margin: 5px 0;"><strong>🌐 IP Address:</strong> ${ip || "Unknown"}</p>
            <p style="margin: 5px 0;"><strong>💻 Device:</strong> ${deviceName}</p>
          </div>

          <p>If you did not perform this action, <strong>reset your password NOW</strong>.</p>
        </div>
      `,
      text: `Password changed at ${timeIST}. IP: ${ip}. Device: ${deviceName}.`,
    };
  },

  profilePhotoUpdated: ({ ip, userAgent }) => {
    const deviceName = getDeviceDetails(userAgent);
    const timeIST = getISTTime();

    return {
      subject: "Security Alert: Profile Photo Updated",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Your Profile Photo Was Changed</h2>
          <p>Your Rivo account profile picture was updated successfully.</p>
           <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
            <p style="margin: 5px 0;"><strong>Time:</strong> ${timeIST}</p>
            <p style="margin: 5px 0;"><strong>Device:</strong> ${deviceName}</p>
             <p style="margin: 5px 0;"><strong>IP:</strong> ${ip || "Unknown"}</p>
          </div>
        </div>
      `,
      text: `Profile photo updated at ${timeIST}. Device: ${deviceName}`,
    };
  },

  profilePhotoDeleted: ({ ip, userAgent }) => {
    const deviceName = getDeviceDetails(userAgent);
    const timeIST = getISTTime();

    return {
      subject: "Security Alert: Profile Photo Removed",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Your Profile Photo Was Removed</h2>
          <p>Your Rivo account profile picture was removed.</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
            <p style="margin: 5px 0;"><strong>Time:</strong> ${timeIST}</p>
            <p style="margin: 5px 0;"><strong>Device:</strong> ${deviceName}</p>
             <p style="margin: 5px 0;"><strong>IP:</strong> ${ip || "Unknown"}</p>
          </div>
        </div>
      `,
      text: `Profile photo removed at ${timeIST}.`,
    };
  },

  userLoggedIn: ({ fullName, ip, userAgent }) => {
    const deviceName = getDeviceDetails(userAgent);
    const timeIST = getISTTime();

    return {
      subject: "Security Alert: New Login Detected",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #28a745;">Welcome Back, ${fullName.firstName || "User"}!</h2>
          <p>A new login to your Rivo account was detected.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;">
            <p style="margin: 5px 0;"><strong>📅 Time:</strong> ${timeIST} (IST)</p>
            <p style="margin: 5px 0;"><strong>🌐 IP Address:</strong> ${ip || "Unknown"}</p>
            <p style="margin: 5px 0;"><strong>💻 Device:</strong> ${deviceName}</p>
          </div>

          <p>If this wasn't you: <strong>Please secure your account immediately.</strong></p>
        </div>
      `,
      text: `New login detected for ${fullName.firstName || ""} at ${timeIST}. IP: ${ip}. Device: ${deviceName}`,
    };
  },
};

// ==========================================
// 3. GMAIL CLIENT SETUP (Singleton)
// ==========================================

let oauth2ClientInstance = null;

const getGmailClient = () => {
  const required = ["CLIENT_ID", "CLIENT_SECRET", "REFRESH_TOKEN", "EMAIL_USER"];
  const missing = required.filter((k) => !config[k]);
  
  if (missing.length) {
    throw new Error(`[Email Service] Missing config: ${missing.join(", ")}`);
  }

  // Initialize client only once
  if (!oauth2ClientInstance) {
    oauth2ClientInstance = new google.auth.OAuth2(
      config.CLIENT_ID,
      config.CLIENT_SECRET,
      config.REDIRECT_URI || "https://developers.google.com/oauthplayground"
    );

    oauth2ClientInstance.setCredentials({
      refresh_token: config.REFRESH_TOKEN,
    });

    // Handle token refresh events internally
    oauth2ClientInstance.on("tokens", (tokens) => {
      if (tokens.refresh_token) {
        console.log("[Email Service] New refresh token received (Save this to DB if needed):", tokens.refresh_token);
      }
      // console.log("New access token received"); 
    });
  }

  return google.gmail({ version: "v1", auth: oauth2ClientInstance });
};

// ==========================================
// 4. SEND EMAIL FUNCTION
// ==========================================

export default async function sendEmail(to, subject, text, html) {
  try {
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

    // Encode the message for Gmail API (RFC 4648 base64url)
    const raw = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    console.log(`[Email Service] Sent '${subject}' to ${to}. ID: ${res.data.id}`);
    return res.data;

  } catch (err) {
    console.error("[Email Service] Failed to send email:", err.message);
    if (err.response) {
      console.error("[Email Service] Gmail API error details:", err.response.data);
    }
    throw err;
  }
}