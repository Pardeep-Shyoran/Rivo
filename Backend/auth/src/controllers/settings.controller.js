import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { uploadToImageKit, deleteFromImageKit } from "../services/imagekit.service.js";
import { publishToQueue } from "../broker/rabbit.js"; // re-added for security notifications

// Get user settings/profile
export async function getUserSettings(req, res) {
  try {
    const user = await userModel.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        bio: user.bio || "",
        profilePicture: user.profilePicture || "",
        preferences: user.preferences || {},
        notifications: user.notifications || {},
        privacy: user.privacy || {},
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Update profile information
export async function updateProfile(req, res) {
  try {
    const { firstName, lastName, bio } = req.body;
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Track changes for security notification
    const changedFields = [];
    if (firstName && firstName !== user.fullName?.firstName) changedFields.push("firstName");
    if (lastName && lastName !== user.fullName?.lastName) changedFields.push("lastName");
    if (bio !== undefined && bio !== user.bio) changedFields.push("bio");

    // Apply updates (email is immutable)
    if (firstName || lastName) {
      user.fullName = {
        firstName: firstName || user.fullName?.firstName || "",
        lastName: lastName || user.fullName?.lastName || "",
      };
    }
    if (bio !== undefined) user.bio = bio;

    await user.save();

    // Publish security notification only if something actually changed
    if (changedFields.length) {
      try {
        await publishToQueue("user_profile_updated", {
          userId: user._id.toString(),
          email: user.email,
          changed: changedFields,
          timestamp: new Date().toISOString(),
          ip: req.ip,
          userAgent: req.headers['user-agent'] || 'unknown',
        });
      } catch (e) {
        console.warn("Failed to enqueue profile update notification:", e.message);
      }
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        bio: user.bio,
      },
      changedFields,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Update password
export async function updatePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "Cannot update password for Google authenticated users",
      });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash and save
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Publish security notification for password change
    try {
      await publishToQueue("user_password_changed", {
        userId: user._id.toString(),
        email: user.email,
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.headers['user-agent'] || 'unknown',
      });
    } catch (e) {
      console.warn("Failed to enqueue password change notification:", e.message);
    }

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Update notification preferences
export async function updateNotificationPreferences(req, res) {
  try {
    const { emailNotifications, recommendations, analytics, fanMessages, marketing } = req.body;
    const userId = req.user.id;

    const notifications = {};
    if (emailNotifications !== undefined) notifications.emailNotifications = emailNotifications;
    if (recommendations !== undefined) notifications.recommendations = recommendations;
    if (analytics !== undefined) notifications.analytics = analytics;
    if (fanMessages !== undefined) notifications.fanMessages = fanMessages;
    if (marketing !== undefined) notifications.marketing = marketing;

    const user = await userModel.findByIdAndUpdate(
      userId,
      { $set: { notifications } },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Notification preferences updated successfully",
      notifications: user.notifications,
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Update privacy settings
export async function updatePrivacySettings(req, res) {
  try {
    const { publicProfile, showActivity, shareData } = req.body;
    const userId = req.user.id;

    const privacy = {};
    if (publicProfile !== undefined) privacy.publicProfile = publicProfile;
    if (showActivity !== undefined) privacy.showActivity = showActivity;
    if (shareData !== undefined) privacy.shareData = shareData;

    const user = await userModel.findByIdAndUpdate(
      userId,
      { $set: { privacy } },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Privacy settings updated successfully",
      privacy: user.privacy,
    });
  } catch (error) {
    console.error("Error updating privacy settings:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Update app preferences
export async function updatePreferences(req, res) {
  try {
    const { theme, language, audioQuality, explicitContent } = req.body;
    const userId = req.user.id;

    const preferences = {};
    if (theme) preferences.theme = theme;
    if (language) preferences.language = language;
    if (audioQuality) preferences.audioQuality = audioQuality;
    if (explicitContent !== undefined) preferences.explicitContent = explicitContent;

    const user = await userModel.findByIdAndUpdate(
      userId,
      { $set: { preferences } },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Preferences updated successfully",
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Delete user account
export async function deleteAccount(req, res) {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password if user has one (not Google auth)
    if (user.password) {
      if (!password) {
        return res.status(400).json({
          message: "Password required to delete account",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Incorrect password" });
      }
    }

    // Publish account deletion event
    await publishToQueue("user_account_deleted", {
      id: user._id,
      email: user.email,
      role: user.role,
    });

    // Delete user
    await userModel.findByIdAndDelete(userId);

    // Clear cookie
    res.clearCookie("token");

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Upload profile picture
export async function uploadProfilePicture(req, res) {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        message: "Invalid file type. Only JPEG, PNG, and WebP are allowed" 
      });
    }

    // Validate file size (max 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        message: "File too large. Maximum size is 5MB" 
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old profile picture if exists
    if (user.profilePictureFileId) {
      try {
        await deleteFromImageKit(user.profilePictureFileId);
      } catch (error) {
        console.error("Error deleting old profile picture:", error);
        // Continue even if deletion fails
      }
    }

    // Upload to ImageKit
    const fileName = `${userId}-${Date.now()}.${req.file.originalname.split('.').pop()}`;
    const uploadResult = await uploadToImageKit(
      req.file.buffer,
      fileName,
      'profile-pictures'
    );

    // Update user profile picture
    user.profilePicture = uploadResult.url;
    user.profilePictureFileId = uploadResult.fileId;
    await user.save();

    // Security/event notification for profile picture change
    try {
      await publishToQueue("user_profile_picture_updated", {
        userId: user._id.toString(),
        email: user.email,
        profilePicture: uploadResult.url,
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.headers['user-agent'] || 'unknown',
      });
    } catch (e) {
      console.warn("Failed to enqueue profile picture updated notification:", e.message);
    }

    res.status(200).json({
      message: "Profile picture updated successfully",
      profilePicture: uploadResult.url,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Delete profile picture
export async function deleteProfilePicture(req, res) {
  try {
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.profilePictureFileId) {
      return res.status(400).json({ message: "No profile picture to delete" });
    }

    // Delete from ImageKit
    try {
      await deleteFromImageKit(user.profilePictureFileId);
    } catch (error) {
      console.error("Error deleting from ImageKit:", error);
      // Continue to update database even if deletion fails
    }

    // Update user
    user.profilePicture = "";
    user.profilePictureFileId = "";
    await user.save();

    // Security/event notification for profile picture deletion
    try {
      await publishToQueue("user_profile_picture_deleted", {
        userId: user._id.toString(),
        email: user.email,
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.headers['user-agent'] || 'unknown',
      });
    } catch (e) {
      console.warn("Failed to enqueue profile picture deleted notification:", e.message);
    }

    res.status(200).json({
      message: "Profile picture deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Export user data
export async function exportUserData(req, res) {
  try {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // In a real application, you would gather all user data from different services
    const userData = {
      profile: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        bio: user.bio,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
      preferences: user.preferences || {},
      notifications: user.notifications || {},
      privacy: user.privacy || {},
      exportedAt: new Date().toISOString(),
    };

    res.status(200).json({
      message: "User data exported successfully",
      data: userData,
    });
  } catch (error) {
    console.error("Error exporting user data:", error);
    res.status(500).json({ message: "Server error" });
  }
}
