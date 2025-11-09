import express from 'express';
import multer from 'multer';
import * as settingsController from '../controllers/settings.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// All settings routes require authentication
router.use(authMiddleware);

// Get user settings
router.get('/', settingsController.getUserSettings);

// Update profile
router.put('/profile', settingsController.updateProfile);

// Update password
router.put('/password', settingsController.updatePassword);

// Update notification preferences
router.put('/notifications', settingsController.updateNotificationPreferences);

// Update privacy settings
router.put('/privacy', settingsController.updatePrivacySettings);

// Update app preferences
router.put('/preferences', settingsController.updatePreferences);

// Upload profile picture
router.post('/profile-picture', upload.single('profilePicture'), settingsController.uploadProfilePicture);

// Delete profile picture
router.delete('/profile-picture', settingsController.deleteProfilePicture);

// Export user data
router.get('/export', settingsController.exportUserData);

// Delete account
router.delete('/account', settingsController.deleteAccount);

export default router;
