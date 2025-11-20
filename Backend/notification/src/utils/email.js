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
// EMAIL LAYOUT WRAPPER
// ==========================================
export const emailLayout = (content, greeting = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rivo</title>
</head>
<body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color:#f6f9fc;">
    <table role="presentation" style="width:100%; border-collapse:collapse; background-color:#f6f9fc; padding:40px 0;">
        <tr>
            <td align="center">
                <table role="presentation" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:12px; box-shadow: 0 4px 6px rgba(0,0,0,0.07); overflow:hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding:30px; text-align:center;">
                            <h1 style="margin:0; color:#ffffff; font-size:32px; font-weight:700; letter-spacing:-0.5px;">Rivo</h1>
                            <p style="margin:5px 0 0 0; color:#ffffff; opacity:0.95; font-size:14px;">Your Music, Your Way</p>
                        </td>
                    </tr>
                    <!-- Greeting -->
                    ${greeting ? `
                    <tr>
                        <td style="padding:30px 40px 20px 40px;">
                            <p style="margin:0; font-size:16px; color:#1a1a1a; font-weight:500;">Hi ${greeting},</p>
                        </td>
                    </tr>
                    ` : ''}
                    <!-- Content -->
                    <tr>
                        <td style="padding:${greeting ? '0' : '30px'} 40px 30px 40px; color:#4a5568; font-size:15px; line-height:1.6;">
                            ${content}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color:#f7fafc; padding:25px 40px; border-top:1px solid #e2e8f0;">
                            <p style="margin:0 0 10px 0; font-size:13px; color:#718096; line-height:1.5;">
                                Need help? Contact us at <a href="mailto:support@rivo.com" style="color:#667eea; text-decoration:none;">support@rivo.com</a>
                            </p>
                            <p style="margin:0; font-size:12px; color:#a0aec0;">
                                © ${new Date().getFullYear()} Rivo. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// Security Info Box Component
const securityInfoBox = (time, ip, deviceName) => `
<div style="background: linear-gradient(to right, #f7fafc, #edf2f7); border-left:4px solid #667eea; padding:20px; border-radius:8px; margin:20px 0;">
    <p style="margin:0 0 12px 0; font-size:14px; font-weight:600; color:#2d3748;">Security Details:</p>
    <table style="width:100%; font-size:14px; color:#4a5568;">
        <tr>
            <td style="padding:4px 0; font-weight:500; width:100px;">Time (IST):</td>
            <td style="padding:4px 0;">${time}</td>
        </tr>
        <tr>
            <td style="padding:4px 0; font-weight:500;">IP Address:</td>
            <td style="padding:4px 0;">${ip || "Unknown"}</td>
        </tr>
        <tr>
            <td style="padding:4px 0; font-weight:500;">Device:</td>
            <td style="padding:4px 0;">${deviceName}</td>
        </tr>
    </table>
</div>
`;

// Warning Box Component
const warningBox = (message) => `
<div style="background-color:#fff5f5; border:1px solid #feb2b2; border-radius:8px; padding:16px; margin:20px 0;">
    <p style="margin:0; color:#c53030; font-size:14px; font-weight:500;">
        ⚠️ ${message}
    </p>
</div>
`;

// ==========================================
// TEMPLATES
// ==========================================
export const templates = {
  profileUpdated: ({ changed, ip, userAgent, fullName }) => {
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

  passwordChanged: ({ ip, userAgent, fullName }) => {
    const time = getISTTime();
    const deviceName = getDeviceDetails(userAgent);
    const userName = fullName ? `${fullName.firstName || ""} ${fullName.lastName || ""}`.trim() : "";

    const content = `
        <h2 style="margin:0 0 20px 0; font-size:24px; color:#1a202c; font-weight:600;">Password Changed Successfully</h2>
        <p style="margin:0 0 15px 0;">Your Rivo account password was successfully changed. This is a security notification to confirm the update.</p>
        ${securityInfoBox(time, ip, deviceName)}
        ${warningBox("If you didn't change your password, please contact our support team immediately. Someone may have unauthorized access to your account.")}
        <p style="margin:20px 0 0 0; color:#4a5568;">
            We recommend using a strong, unique password and enabling two-factor authentication for additional security.
        </p>
    `;

    return {
      subject: "Security Alert: Password Changed",
      html: emailLayout(content, userName),
      text: `Password changed at ${time}. IP: ${ip}. Device: ${deviceName}.`,
    };
  },

  profilePhotoUpdated: ({ ip, userAgent, fullName }) => {
    const time = getISTTime();
    const deviceName = getDeviceDetails(userAgent);
    const userName = fullName ? `${fullName.firstName || ""} ${fullName.lastName || ""}`.trim() : "";

    const content = `
        <h2 style="margin:0 0 20px 0; font-size:24px; color:#1a202c; font-weight:600;">Profile Photo Updated</h2>
        <p style="margin:0 0 15px 0;">Your Rivo account profile picture has been successfully updated. Your new photo is now visible across the platform.</p>
        ${securityInfoBox(time, ip, deviceName)}
        <div style="background-color:#f0fdf4; border:1px solid #86efac; border-radius:8px; padding:16px; margin:20px 0;">
            <p style="margin:0; color:#166534; font-size:14px; font-weight:500;">
                ✓ Your profile has been updated successfully
            </p>
        </div>
        <p style="margin:20px 0 0 0; color:#4a5568;">
            If you didn't make this change, please contact our support team.
        </p>
    `;

    return {
      subject: "Profile Photo Updated",
      html: emailLayout(content, userName),
      text: `Profile photo updated at ${time}. Device: ${deviceName}.`,
    };
  },

  profilePhotoDeleted: ({ ip, userAgent, fullName }) => {
    const time = getISTTime();
    const deviceName = getDeviceDetails(userAgent);
    const userName = fullName ? `${fullName.firstName || ""} ${fullName.lastName || ""}`.trim() : "";

    const content = `
        <h2 style="margin:0 0 20px 0; font-size:24px; color:#1a202c; font-weight:600;">Profile Photo Removed</h2>
        <p style="margin:0 0 15px 0;">Your Rivo account profile picture has been removed. Your profile now displays the default avatar.</p>
        ${securityInfoBox(time, ip, deviceName)}
        <p style="margin:20px 0 0 0; color:#4a5568;">
            You can upload a new profile photo anytime from your account settings. If you didn't make this change, please contact our support team.
        </p>
    `;

    return {
      subject: "Profile Photo Removed",
      html: emailLayout(content, userName),
      text: `Profile photo removed at ${time}. Device: ${deviceName}.`,
    };
  },

  userLoggedIn: ({ fullName, ip, userAgent }) => {
    const time = getISTTime();
    const deviceName = getDeviceDetails(userAgent);
    const userName = fullName ? `${fullName.firstName || ""} ${fullName.lastName || ""}`.trim() : "";

    const content = `
        <h2 style="margin:0 0 20px 0; font-size:24px; color:#1a202c; font-weight:600;">New Login Detected</h2>
        <p style="margin:0 0 15px 0;">We detected a new login to your Rivo account. Welcome back!</p>
        ${securityInfoBox(time, ip, deviceName)}
        ${warningBox("If this wasn't you, please secure your account immediately by changing your password.")}
        <p style="margin:20px 0 0 0; color:#4a5568;">
            We're always working to keep your account secure. If you have any concerns, please don't hesitate to contact us.
        </p>
    `;

    return {
      subject: "Security Alert: New Login Detected",
      html: emailLayout(content, userName),
      text: `New login detected for ${userName} at ${time}. IP: ${ip}. Device: ${deviceName}.`,
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