# Email Templates Documentation

This document provides a comprehensive overview of all email templates available in the Rivo notification service.

## Overview

All email templates are located in `/Backend/notification/src/utils/emailTemplates.js` and are automatically imported into the email service. Each template includes:

- **Professional HTML Layout** with Rivo branding
- **Security Details** (Time in IST, IP Address, Device Information)
- **Responsive Design** optimized for all email clients
- **Plain Text Version** for accessibility

## Device Information

All security-related emails now include properly parsed device information using the `ua-parser-js` library:

- **Browser**: Chrome, Firefox, Safari, Edge, etc.
- **Operating System**: Windows 10, macOS, iOS, Android, etc.
- **Device Model**: For mobile devices (if available)

Example format: `Chrome on Windows 10` or `Safari on iOS 15.0`

## Available Email Templates

### 1. User Registration (`userRegistered`)

**Purpose**: Welcome new users to the platform

**Queue**: `user_created`

**Parameters**:
- `fullName` - User's full name object `{ firstName, lastName }`
- `role` - User's account role (e.g., "listener", "artist")

**Features**:
- Welcoming message
- Overview of platform features
- Getting started guide

---

### 2. User Login (`userLoggedIn`)

**Purpose**: Notify users of new login activity

**Queue**: `user_logged_in`

**Parameters**:
- `fullName` - User's full name object
- `ip` - IP address of the login
- `userAgent` - Browser/device user agent string

**Features**:
- Login timestamp (IST)
- IP address
- Device information (Browser on OS)
- Security warning if unauthorized

---

### 3. Profile Updated (`profileUpdated`)

**Purpose**: Alert users when their profile information changes

**Queue**: `user_profile_updated`

**Parameters**:
- `fullName` - User's full name object
- `changed` - Array of field names that were changed (e.g., `["First Name", "Phone Number"]`)
- `ip` - IP address where change was made
- `userAgent` - Browser/device user agent string

**Features**:
- List of changed fields
- Security details box with time, IP, and device
- Warning if change wasn't authorized

---

### 4. Password Changed (`passwordChanged`)

**Purpose**: Confirm password has been successfully changed

**Queue**: `user_password_changed`

**Parameters**:
- `fullName` - User's full name object
- `ip` - IP address where change was made
- `userAgent` - Browser/device user agent string

**Features**:
- Confirmation of password change
- Security details
- Urgent warning with instructions if unauthorized
- Security recommendations

---

### 5. Password Reset Request (`passwordResetRequested`)

**Purpose**: Provide password reset link to users

**Queue**: `password_reset_requested` (to be implemented)

**Parameters**:
- `fullName` - User's full name object
- `resetLink` - Unique password reset URL
- `expiresIn` - Time until link expires (default: "1 hour")
- `ip` - IP address of request
- `userAgent` - Browser/device user agent string

**Features**:
- Prominent reset button
- Expiration notice
- Security details
- Note for users who didn't request reset

---

### 6. Email Address Changed (`emailChanged`)

**Purpose**: Notify users when their email address is updated

**Queue**: `user_email_changed` (to be implemented)

**Parameters**:
- `fullName` - User's full name object
- `oldEmail` - Previous email address
- `newEmail` - New email address
- `ip` - IP address where change was made
- `userAgent` - Browser/device user agent string

**Features**:
- Clear display of old and new email
- Security details
- Warning if unauthorized
- Sent to both old and new email addresses

---

### 7. Profile Photo Updated (`profilePhotoUpdated`)

**Purpose**: Confirm profile picture has been updated

**Queue**: `user_profile_picture_updated`

**Parameters**:
- `fullName` - User's full name object
- `ip` - IP address where change was made
- `userAgent` - Browser/device user agent string

**Features**:
- Confirmation message
- Security details
- Success indicator

---

### 8. Profile Photo Deleted (`profilePhotoDeleted`)

**Purpose**: Notify when profile picture is removed

**Queue**: `user_profile_picture_deleted`

**Parameters**:
- `fullName` - User's full name object
- `ip` - IP address where change was made
- `userAgent` - Browser/device user agent string

**Features**:
- Deletion confirmation
- Security details
- Instructions to upload new photo

---

### 9. Account Deletion Scheduled (`accountDeletionScheduled`)

**Purpose**: Confirm account deletion request and provide details

**Queue**: `account_deletion_scheduled` (to be implemented)

**Parameters**:
- `fullName` - User's full name object
- `deletionDate` - Formatted date when account will be deleted
- `ip` - IP address of request
- `userAgent` - Browser/device user agent string

**Features**:
- Deletion date
- What happens next timeline
- Security details
- Instructions to cancel deletion

---

### 10. Account Reactivated (`accountReactivated`)

**Purpose**: Welcome back users who reactivate their account

**Queue**: `account_reactivated` (to be implemented)

**Parameters**:
- `fullName` - User's full name object
- `ip` - IP address of reactivation
- `userAgent` - Browser/device user agent string

**Features**:
- Welcome back message
- Account status confirmation
- Security details

---

### 11. Email Verification (`emailVerification`)

**Purpose**: Verify email address for new accounts

**Queue**: `email_verification_requested` (to be implemented)

**Parameters**:
- `fullName` - User's full name object
- `verificationLink` - Unique verification URL
- `expiresIn` - Time until link expires (default: "24 hours")

**Features**:
- Prominent verification button
- Expiration notice
- Alternative link copy option
- Note for non-registrants

---

### 12. Two-Factor Authentication Enabled (`twoFactorEnabled`)

**Purpose**: Confirm 2FA has been activated

**Queue**: `two_factor_enabled` (to be implemented)

**Parameters**:
- `fullName` - User's full name object
- `ip` - IP address where change was made
- `userAgent` - Browser/device user agent string

**Features**:
- Confirmation message
- Explanation of 2FA benefits
- Security details
- Warning if unauthorized

---

### 13. Two-Factor Authentication Disabled (`twoFactorDisabled`)

**Purpose**: Alert when 2FA is turned off

**Queue**: `two_factor_disabled` (to be implemented)

**Parameters**:
- `fullName` - User's full name object
- `ip` - IP address where change was made
- `userAgent` - Browser/device user agent string

**Features**:
- Disabling confirmation
- Security warning
- Recommendations to re-enable
- Security details

---

### 14. Suspicious Activity Detected (`suspiciousActivity`)

**Purpose**: Alert users of potential security threats

**Queue**: `suspicious_activity_detected` (to be implemented)

**Parameters**:
- `fullName` - User's full name object
- `activityDetails` - Description of suspicious activity
- `ip` - IP address of suspicious activity
- `userAgent` - Browser/device user agent string

**Features**:
- High-priority alert styling
- Activity details
- Security details
- Immediate action checklist
- Contact support information

---

## Usage in Listener

All templates are used through the `templates` object imported from `email.js`:

```javascript
import sendEmail, { templates } from '../utils/email.js';

subscribeToQueue('user_created', async (msg) => {
    const { email, role, fullName } = msg;
    const { subject, text, html } = templates.userRegistered({ fullName, role });
    await sendEmail(email, subject, text, html);
});
```

## Security Details Box

All security-related emails include a standardized security information box showing:

- **Time (IST)**: Formatted as "19 Nov, 2025 at 11:30 PM"
- **IP Address**: The IP from which the action was performed
- **Device**: Parsed from user agent string (e.g., "Chrome on Windows 10")

## Styling Conventions

All templates follow consistent styling:

- **Primary Color**: `#667eea` (Purple)
- **Secondary Color**: `#764ba2` (Darker Purple)
- **Success**: `#38a169` (Green)
- **Warning**: `#f59e0b` (Orange)
- **Error**: `#c53030` (Red)
- **Font**: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto)

## To Implement

The following queues need to be added to the RabbitMQ listener:

- `password_reset_requested`
- `user_email_changed`
- `account_deletion_scheduled`
- `account_reactivated`
- `email_verification_requested`
- `two_factor_enabled`
- `two_factor_disabled`
- `suspicious_activity_detected`

## Testing

To test email templates:

1. Start the notification service: `cd Backend/notification && npm run dev`
2. Publish a test message to RabbitMQ with the appropriate queue name and data
3. Check the email delivery in the target inbox

## Support

For issues or questions about email templates, contact the development team or check the support email configured in `config.js`.

---

**Last Updated**: November 20, 2025  
**File Location**: `/Backend/notification/src/utils/emailTemplates.js`  
**Listener Location**: `/Backend/notification/src/broker/listener.js`
