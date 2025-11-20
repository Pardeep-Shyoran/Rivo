import { emailLayout } from './email.js';

// ==========================================
// HELPER FUNCTIONS (Time & Device Parsing)
// ==========================================

/**
 * Get Current Time in India (IST)
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
 * Parse User Agent String into Readable Text
 * Input: "Mozilla/5.0 (Windows NT 10.0...)"
 * Output: "Chrome on Windows 10"
 */
import { UAParser } from "ua-parser-js";

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
// REUSABLE COMPONENTS
// ==========================================

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

// Success Box Component
const successBox = (message) => `
<div style="background-color:#f0fdf4; border:1px solid #86efac; border-radius:8px; padding:16px; margin:20px 0;">
    <p style="margin:0; color:#166534; font-size:14px; font-weight:500;">
        ✓ ${message}
    </p>
</div>
`;

// Info Box Component
const infoBox = (title, items) => `
<div style="background-color:#fef3c7; border-left:4px solid #f59e0b; padding:15px 20px; border-radius:6px; margin:20px 0;">
    <p style="margin:0 0 10px 0; font-weight:600; color:#92400e;">${title}</p>
    <ul style="margin:0; padding-left:20px; color:#92400e; line-height:1.6;">
        ${items.map(item => `<li>${item}</li>`).join('')}
    </ul>
</div>
`;

// ==========================================
// EMAIL TEMPLATES
// ==========================================

export const emailTemplates = {
  // 1. User Registration Welcome Email
  userRegistered: ({ fullName, role }) => {
    const userName = fullName ? `${fullName.firstName || ""} ${fullName.lastName || ""}`.trim() : "";

    const content = `
        <h2 style="margin:0 0 20px 0; font-size:24px; color:#1a202c; font-weight:600;">Welcome to Rivo!</h2>
        <p style="margin:0 0 15px 0;">We're thrilled to have you join our music community. Your account has been successfully created with the role of <strong style="color:#667eea;">${role}</strong>.</p>
        
        <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-radius:8px; padding:20px; margin:20px 0;">
            <h3 style="margin:0 0 15px 0; font-size:18px; color:#1a202c; font-weight:600;">Get Started:</h3>
            <ul style="margin:0; padding-left:20px; color:#4a5568; line-height:1.8;">
                <li>Explore millions of songs and playlists</li>
                <li>Create and share your own playlists</li>
                <li>Connect with artists and other music lovers</li>
                <li>Discover personalized music recommendations</li>
            </ul>
        </div>

        <p style="margin:20px 0 0 0; color:#4a5568;">
            If you have any questions or need assistance, our support team is here to help.
        </p>
    `;

    return {
      subject: "Welcome to Rivo!",
      html: emailLayout(content, userName),
      text: `Welcome to Rivo, ${userName}! Your ${role} account is ready.`,
    };
  },

  // 2. User Login Notification
  userLoggedIn: ({ fullName, ip, ipAddress, userAgent }) => {
    const time = getISTTime();
    const deviceName = getDeviceDetails(userAgent);
    const userName = fullName ? `${fullName.firstName || ""} ${fullName.lastName || ""}`.trim() : "";

    const resolvedIp = ipAddress || ip;
    const content = `
        <h2 style="margin:0 0 20px 0; font-size:24px; color:#1a202c; font-weight:600;">New Login Detected</h2>
        <p style="margin:0 0 15px 0;">We detected a new login to your Rivo account. Welcome back!</p>
        ${securityInfoBox(time, resolvedIp, deviceName)}
        ${warningBox("If this wasn't you, please secure your account immediately by changing your password.")}
        <p style="margin:20px 0 0 0; color:#4a5568;">
            We're always working to keep your account secure. If you have any concerns, please don't hesitate to contact us.
        </p>
    `;

    return {
      subject: "Security Alert: New Login Detected",
      html: emailLayout(content, userName),
      text: `New login detected for ${userName} at ${time}. IP: ${resolvedIp}. Device: ${deviceName}.`,
    };
  },

  // 3. Profile Updated with Security Details
  profileUpdated: ({ changed, ip, ipAddress, userAgent, fullName }) => {
    const time = getISTTime();
    const deviceName = getDeviceDetails(userAgent);
    const userName = fullName ? `${fullName.firstName || ""} ${fullName.lastName || ""}`.trim() : "";

    const changedFields = changed.map((field) => 
      `<li style="padding:5px 0; color:#4a5568;">${field}</li>`
    ).join("");

    const resolvedIp = ipAddress || ip;
    const content = `
        <h2 style="margin:0 0 20px 0; font-size:24px; color:#1a202c; font-weight:600;">Profile Changes Detected</h2>
        <p style="margin:0 0 15px 0;">The following fields on your Rivo profile were successfully updated:</p>
        
        <div style="background-color:#f7fafc; border-left:4px solid #667eea; padding:15px 20px; border-radius:6px; margin:15px 0;">
            <ul style="margin:0; padding-left:20px;">
                ${changedFields}
            </ul>
        </div>

        ${securityInfoBox(time, resolvedIp, deviceName)}
        ${warningBox("If you didn't make these changes, please secure your account immediately by changing your password and contacting our support team.")}
        
        <p style="margin:20px 0 0 0; color:#4a5568;">
            We're committed to keeping your account secure. Review your security settings regularly to ensure your account stays protected.
        </p>
    `;

    return {
      subject: "Security Alert: Your Profile Was Updated",
      html: emailLayout(content, userName),
      text: `Profile updated. Changes: ${changed.join(", ")}. Time: ${time}. IP: ${resolvedIp}. Device: ${deviceName}.`,
    };
  },

  // 4. Password Changed
  passwordChanged: ({ ip, ipAddress, userAgent, fullName }) => {
    const time = getISTTime();
    const deviceName = getDeviceDetails(userAgent);
    const userName = fullName ? `${fullName.firstName || ""} ${fullName.lastName || ""}`.trim() : "";

    const resolvedIp = ipAddress || ip;
    const content = `
        <h2 style="margin:0 0 20px 0; font-size:24px; color:#1a202c; font-weight:600;">Password Changed Successfully</h2>
        <p style="margin:0 0 15px 0;">Your Rivo account password was successfully changed. This is a security notification to confirm the update.</p>
        ${securityInfoBox(time, resolvedIp, deviceName)}
        ${warningBox("If you didn't change your password, please contact our support team immediately. Someone may have unauthorized access to your account.")}
        <p style="margin:20px 0 0 0; color:#4a5568;">
            We recommend using a strong, unique password and enabling two-factor authentication for additional security.
        </p>
    `;

    return {
      subject: "Security Alert: Password Changed",
      html: emailLayout(content, userName),
      text: `Password changed at ${time}. IP: ${resolvedIp}. Device: ${deviceName}.`,
    };
  },

  // 5. Password Reset Requested
  passwordResetRequested: ({ ip, ipAddress, userAgent, fullName, resetLink, expiresIn = "1 hour" }) => {
    const time = getISTTime();
    const deviceName = getDeviceDetails(userAgent);
    const userName = fullName ? `${fullName.firstName || ""} ${fullName.lastName || ""}`.trim() : "";

    const resolvedIp = ipAddress || ip;
    const content = `
        <h2 style="margin:0 0 20px 0; font-size:24px; color:#1a202c; font-weight:600;">Password Reset Request</h2>
        <p style="margin:0 0 15px 0;">We received a request to reset your Rivo account password. Click the button below to create a new password:</p>
        
        <div style="text-align:center; margin:30px 0;">
            <a href="${resetLink}" style="display:inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:#ffffff; padding:14px 32px; text-decoration:none; border-radius:8px; font-weight:600; font-size:16px;">Reset Password</a>
        </div>

        <p style="margin:15px 0; padding:12px; background-color:#fef3c7; border-left:4px solid #f59e0b; border-radius:6px; color:#92400e; font-size:14px;">
            ⏱️ This link will expire in ${expiresIn}.
        </p>

        ${securityInfoBox(time, resolvedIp, deviceName)}
        
        <div style="background-color:#f7fafc; padding:15px; border-radius:8px; margin:20px 0;">
            <p style="margin:0; font-size:13px; color:#4a5568;">
                <strong>Note:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged, and your account is secure.
            </p>
        </div>
    `;

    return {
      subject: "Password Reset Request",
      html: emailLayout(content, userName),
      text: `Password reset requested at ${time}. Link: ${resetLink}. Expires in ${expiresIn}. IP: ${resolvedIp}. Device: ${deviceName}.`,
    };
  },

  // 6. Email Changed
  emailChanged: ({ oldEmail, newEmail, ip, ipAddress, userAgent, fullName }) => {
    const time = getISTTime();
    const deviceName = getDeviceDetails(userAgent);
    const userName = fullName ? `${fullName.firstName || ""} ${fullName.lastName || ""}`.trim() : "";

    const resolvedIp = ipAddress || ip;
    const content = `
        <h2 style="margin:0 0 20px 0; font-size:24px; color:#1a202c; font-weight:600;">Email Address Changed</h2>
        <p style="margin:0 0 15px 0;">The email address associated with your Rivo account has been successfully updated.</p>
        
        <div style="background-color:#f7fafc; border-radius:8px; padding:20px; margin:20px 0;">
            <table style="width:100%; font-size:14px; color:#4a5568;">
                <tr>
                    <td style="padding:8px 0; font-weight:500; width:120px;">Previous Email:</td>
                    <td style="padding:8px 0; color:#e53e3e;">${oldEmail}</td>
                </tr>
                <tr>
                    <td style="padding:8px 0; font-weight:500;">New Email:</td>
                    <td style="padding:8px 0; color:#38a169; font-weight:600;">${newEmail}</td>
                </tr>
            </table>
        </div>

        ${securityInfoBox(time, resolvedIp, deviceName)}
        ${warningBox("If you didn't make this change, someone else may have access to your account. Contact our support team immediately.")}
        
        <p style="margin:20px 0 0 0; color:#4a5568;">
            You'll now use your new email address to sign in to Rivo. This notification has been sent to both your old and new email addresses.
        </p>
    `;

    return {
      subject: "Security Alert: Email Address Changed",
      html: emailLayout(content, userName),
      text: `Email changed from ${oldEmail} to ${newEmail} at ${time}. IP: ${resolvedIp}. Device: ${deviceName}.`,
    };
  },

  // 7. Profile Photo Updated
  profilePhotoUpdated: ({ ip, ipAddress, userAgent, fullName }) => {
    const time = getISTTime();
    const deviceName = getDeviceDetails(userAgent);
    const userName = fullName ? `${fullName.firstName || ""} ${fullName.lastName || ""}`.trim() : "";

    const resolvedIp = ipAddress || ip;
    const content = `
        <h2 style="margin:0 0 20px 0; font-size:24px; color:#1a202c; font-weight:600;">Profile Photo Updated</h2>
        <p style="margin:0 0 15px 0;">Your Rivo account profile picture has been successfully updated. Your new photo is now visible across the platform.</p>
        ${securityInfoBox(time, resolvedIp, deviceName)}
        ${successBox("Your profile has been updated successfully")}
        <p style="margin:20px 0 0 0; color:#4a5568;">
            If you didn't make this change, please contact our support team.
        </p>
    `;

    return {
      subject: "Profile Photo Updated",
      html: emailLayout(content, userName),
      text: `Profile photo updated at ${time}. IP: ${resolvedIp}. Device: ${deviceName}.`,
    };
  },

  // 8. Profile Photo Deleted
  profilePhotoDeleted: ({ ip, ipAddress, userAgent, fullName }) => {
    const time = getISTTime();
    const deviceName = getDeviceDetails(userAgent);
    const userName = fullName ? `${fullName.firstName || ""} ${fullName.lastName || ""}`.trim() : "";

    const resolvedIp = ipAddress || ip;
    const content = `
        <h2 style="margin:0 0 20px 0; font-size:24px; color:#1a202c; font-weight:600;">Profile Photo Removed</h2>
        <p style="margin:0 0 15px 0;">Your Rivo account profile picture has been removed. Your profile now displays the default avatar.</p>
        ${securityInfoBox(time, resolvedIp, deviceName)}
        <p style="margin:20px 0 0 0; color:#4a5568;">
            You can upload a new profile photo anytime from your account settings. If you didn't make this change, please contact our support team.
        </p>
    `;

    return {
      subject: "Profile Photo Removed",
      html: emailLayout(content, userName),
      text: `Profile photo removed at ${time}. IP: ${resolvedIp}. Device: ${deviceName}.`,
    };
  },

  // 9. Account Deletion Scheduled
  accountDeletionScheduled: ({ fullName, deletionDate, ip, ipAddress, userAgent }) => {
    const time = getISTTime();
    const deviceName = getDeviceDetails(userAgent);
    const userName = fullName ? `${fullName.firstName || ""} ${fullName.lastName || ""}`.trim() : "";

    const resolvedIp = ipAddress || ip;
    const content = `
        <h2 style="margin:0 0 20px 0; font-size:24px; color:#1a202c; font-weight:600;">Account Deletion Requested</h2>
        <p style="margin:0 0 15px 0;">We're sorry to see you go. Your Rivo account has been scheduled for deletion on <strong>${deletionDate}</strong>.</p>
        
        ${infoBox("What happens next:", [
          `Your account will remain accessible until ${deletionDate}`,
          "All your data, playlists, and preferences will be permanently deleted",
          "This action cannot be undone after the deletion date"
        ])}

        ${securityInfoBox(time, resolvedIp, deviceName)}
        
        <div style="background-color:#e0e7ff; padding:20px; border-radius:8px; margin:20px 0; text-align:center;">
            <p style="margin:0 0 15px 0; font-weight:600; color:#3730a3; font-size:16px;">Changed your mind?</p>
            <p style="margin:0 0 15px 0; color:#4c51bf;">You can cancel this deletion request by logging into your account before ${deletionDate}.</p>
        </div>
    `;

    return {
      subject: "Account Deletion Scheduled",
      html: emailLayout(content, userName),
      text: `Account deletion scheduled for ${deletionDate}. Request made at ${time}. IP: ${resolvedIp}. Device: ${deviceName}.`,
    };
  },

  // 10. Account Reactivated
  accountReactivated: ({ fullName, ip, ipAddress, userAgent }) => {
    const time = getISTTime();
    const deviceName = getDeviceDetails(userAgent);
    const userName = fullName ? `${fullName.firstName || ""} ${fullName.lastName || ""}`.trim() : "";

    const resolvedIp = ipAddress || ip;
    const content = `
        <h2 style="margin:0 0 20px 0; font-size:24px; color:#1a202c; font-weight:600;">Welcome Back!</h2>
        <p style="margin:0 0 15px 0;">Great news! Your Rivo account has been successfully reactivated. We're glad to have you back in the community.</p>
        
        <div style="background-color:#f0fdf4; border:1px solid #86efac; border-radius:8px; padding:20px; margin:20px 0;">
            <p style="margin:0 0 10px 0; color:#166534; font-weight:600;">Your account is now active:</p>
            <ul style="margin:0; padding-left:20px; color:#166534; line-height:1.6;">
                <li>All your playlists and preferences have been restored</li>
                <li>You can now access all Rivo features</li>
                <li>Continue enjoying your personalized music experience</li>
            </ul>
        </div>

        ${securityInfoBox(time, resolvedIp, deviceName)}
        
        <p style="margin:20px 0 0 0; color:#4a5568;">
            Start exploring and rediscover your favorite music right away!
        </p>
    `;

    return {
      subject: "Welcome Back to Rivo!",
      html: emailLayout(content, userName),
      text: `Account reactivated at ${time}. IP: ${resolvedIp}. Device: ${deviceName}.`,
    };
  },

  // 11. Email Verification
  emailVerification: ({ fullName, verificationLink, expiresIn = "24 hours" }) => {
    const userName = fullName ? `${fullName.firstName || ""} ${fullName.lastName || ""}`.trim() : "";

    const content = `
        <h2 style="margin:0 0 20px 0; font-size:24px; color:#1a202c; font-weight:600;">Verify Your Email Address</h2>
        <p style="margin:0 0 15px 0;">Thank you for registering with Rivo! Please verify your email address to complete your account setup and unlock all features.</p>
        
        <div style="text-align:center; margin:30px 0;">
            <a href="${verificationLink}" style="display:inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:#ffffff; padding:14px 32px; text-decoration:none; border-radius:8px; font-weight:600; font-size:16px;">Verify Email Address</a>
        </div>

        <p style="margin:15px 0; padding:12px; background-color:#fef3c7; border-left:4px solid #f59e0b; border-radius:6px; color:#92400e; font-size:14px;">
            ⏱️ This verification link will expire in ${expiresIn}.
        </p>

        <div style="background-color:#f7fafc; padding:15px; border-radius:8px; margin:20px 0;">
            <p style="margin:0; font-size:13px; color:#4a5568;">
                <strong>Can't click the button?</strong> Copy and paste this link into your browser:<br/>
                <span style="word-break:break-all; color:#667eea;">${verificationLink}</span>
            </p>
        </div>
        
        <p style="margin:20px 0 0 0; color:#4a5568;">
            If you didn't create a Rivo account, please ignore this email.
        </p>
    `;

    return {
      subject: "Verify Your Email Address - Rivo",
      html: emailLayout(content, userName),
      text: `Please verify your email address. Link: ${verificationLink}. Expires in ${expiresIn}.`,
    };
  },

  // 12. Two-Factor Authentication Enabled
  twoFactorEnabled: ({ ip, ipAddress, userAgent, fullName }) => {
    const time = getISTTime();
    const deviceName = getDeviceDetails(userAgent);
    const userName = fullName ? `${fullName.firstName || ""} ${fullName.lastName || ""}`.trim() : "";

    const resolvedIp = ipAddress || ip;
    const content = `
        <h2 style="margin:0 0 20px 0; font-size:24px; color:#1a202c; font-weight:600;">Two-Factor Authentication Enabled</h2>
        <p style="margin:0 0 15px 0;">Two-factor authentication (2FA) has been successfully enabled on your Rivo account. Your account security has been enhanced!</p>
        
        ${successBox("Your account is now more secure with 2FA enabled")}

        <div style="background-color:#e0e7ff; border-radius:8px; padding:20px; margin:20px 0;">
            <p style="margin:0 0 10px 0; color:#3730a3; font-weight:600;">What this means:</p>
            <ul style="margin:0; padding-left:20px; color:#4c51bf; line-height:1.6;">
                <li>You'll need to enter a verification code when logging in</li>
                <li>Your account is protected even if someone knows your password</li>
                <li>You can manage 2FA settings anytime from your security preferences</li>
            </ul>
        </div>

        ${securityInfoBox(time, resolvedIp, deviceName)}
        ${warningBox("If you didn't enable 2FA, someone may have unauthorized access to your account. Contact our support team immediately.")}
    `;

    return {
      subject: "Two-Factor Authentication Enabled",
      html: emailLayout(content, userName),
      text: `2FA enabled at ${time}. IP: ${resolvedIp}. Device: ${deviceName}.`,
    };
  },

  // 13. Two-Factor Authentication Disabled
  twoFactorDisabled: ({ ip, ipAddress, userAgent, fullName }) => {
    const time = getISTTime();
    const deviceName = getDeviceDetails(userAgent);
    const userName = fullName ? `${fullName.firstName || ""} ${fullName.lastName || ""}`.trim() : "";

    const resolvedIp = ipAddress || ip;
    const content = `
        <h2 style="margin:0 0 20px 0; font-size:24px; color:#1a202c; font-weight:600;">Two-Factor Authentication Disabled</h2>
        <p style="margin:0 0 15px 0;">Two-factor authentication (2FA) has been disabled on your Rivo account. Your account security level has been reduced.</p>
        
        ${securityInfoBox(time, resolvedIp, deviceName)}
        ${warningBox("If you didn't disable 2FA, someone may have unauthorized access to your account. Re-enable 2FA immediately and contact our support team.")}

        <div style="background-color:#fef3c7; border-radius:8px; padding:20px; margin:20px 0;">
            <p style="margin:0 0 10px 0; color:#92400e; font-weight:600;">We recommend:</p>
            <ul style="margin:0; padding-left:20px; color:#92400e; line-height:1.6;">
                <li>Re-enabling 2FA to keep your account secure</li>
                <li>Using a strong, unique password</li>
                <li>Monitoring your account activity regularly</li>
            </ul>
        </div>
    `;

    return {
      subject: "Security Alert: Two-Factor Authentication Disabled",
      html: emailLayout(content, userName),
      text: `2FA disabled at ${time}. IP: ${resolvedIp}. Device: ${deviceName}.`,
    };
  },

  // 14. Suspicious Activity Detected
  suspiciousActivity: ({ fullName, activityDetails, ip, ipAddress, userAgent }) => {
    const time = getISTTime();
    const deviceName = getDeviceDetails(userAgent);
    const userName = fullName ? `${fullName.firstName || ""} ${fullName.lastName || ""}`.trim() : "";

    const resolvedIp = ipAddress || ip;
    const content = `
        <h2 style="margin:0 0 20px 0; font-size:24px; color:#c53030; font-weight:600;">⚠️ Suspicious Activity Detected</h2>
        <p style="margin:0 0 15px 0;">We detected unusual activity on your Rivo account that may indicate unauthorized access.</p>
        
        <div style="background-color:#fff5f5; border:2px solid #fc8181; border-radius:8px; padding:20px; margin:20px 0;">
            <p style="margin:0 0 10px 0; color:#c53030; font-weight:600;">Activity Details:</p>
            <p style="margin:0; color:#742a2a; line-height:1.6;">${activityDetails}</p>
        </div>

        ${securityInfoBox(time, resolvedIp, deviceName)}

        <div style="background-color:#e0e7ff; padding:20px; border-radius:8px; margin:20px 0;">
            <p style="margin:0 0 15px 0; font-weight:600; color:#3730a3; font-size:16px;">Immediate Actions Required:</p>
            <ol style="margin:0; padding-left:20px; color:#4c51bf; line-height:1.8;">
                <li>Change your password immediately</li>
                <li>Review your recent account activity</li>
                <li>Enable two-factor authentication if not already enabled</li>
                <li>Check connected devices and log out from unrecognized ones</li>
            </ol>
        </div>
        
        <p style="margin:20px 0 0 0; color:#4a5568;">
            If you need assistance, please contact our support team immediately.
        </p>
    `;

    return {
      subject: "🚨 Security Alert: Suspicious Activity Detected",
      html: emailLayout(content, userName),
      text: `Suspicious activity detected at ${time}. Details: ${activityDetails}. IP: ${resolvedIp}. Device: ${deviceName}. Please secure your account immediately.`,
    };
  },
};

export default emailTemplates;
