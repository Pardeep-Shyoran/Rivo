import { google } from "googleapis";
import MailComposer from "nodemailer/lib/mail-composer/index.js";
import config from "../config/config.js";
import emailTemplates from "./emailTemplates.js";

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
                                Need help? Contact us at <a href="mailto:${config.SUPPORT_EMAIL}" style="color:#667eea; text-decoration:none;">${config.SUPPORT_EMAIL}</a>
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

// ==========================================
// EXPORT EMAIL TEMPLATES
// ==========================================
// All email templates are now in emailTemplates.js for better organization
// Each template includes proper device parsing and security details
export const templates = emailTemplates;

// ==========================================
// EMAIL PROVIDERS
// ==========================================

// Gmail OAuth2 Client (Singleton)
let oauth2ClientInstance = null;

const getGmailClient = () => {
  const required = ["CLIENT_ID", "CLIENT_SECRET", "REFRESH_TOKEN", "EMAIL_USER"];
  const missing = required.filter((k) => !config[k]);
  if (missing.length) {
    throw new Error(`Missing Gmail config: ${missing.join(", ")}`);
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

// Gmail Email Sender (single provider)
async function sendWithGmail(to, subject, text, html) {
  const gmail = getGmailClient();
  const mailOptions = {
    from: `"Rivo Music" <${config.EMAIL_USER}>`,
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
    console.log(`[email] Gmail sent! ID: ${res.data.id}`);
    return { id: res.data.id, provider: 'gmail' };
  } catch (err) {
    const status = err?.code || err?.response?.status;
    const apiMsg = err?.response?.data?.error?.message;
    const details = err?.response?.data || err?.errors || err?.message;
    console.error(
      "[email] Gmail failed:",
      status ? `(status ${status})` : "",
      apiMsg || details
    );
    if ((apiMsg || err?.message || "").toLowerCase().includes("precondition check failed")) {
      console.error(
        "[email] Hint:",
        "This usually means the 'From' address is not a verified send-as alias for the authenticated Gmail account. Set EMAIL_USER to the same Gmail account used for CLIENT_ID/REFRESH_TOKEN, or verify the alias in Gmail settings (Settings > Accounts > Send mail as)."
      );
    }
    throw new Error(apiMsg || err.message || "Gmail send failed");
  }
}

// Main Email Function - Auto-selects provider
export default async function sendEmail(to, subject, text, html) {
  console.log(`[email] Sending via GMAIL to ${to}`);
  try {
    return await sendWithGmail(to, subject, text, html);
  } catch (error) {
    console.error(`[email] Failed to send via gmail:`, error.message);
    throw error;
  }
}
