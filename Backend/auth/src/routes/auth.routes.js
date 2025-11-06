import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as validationRules from '../middlewares/validation.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import passport from 'passport';




const router = express.Router();

router.post("/register", validationRules.registerUserValidationRules, authController.register);

router.post("/login", validationRules.loginUserValidationRules, authController.login);

// Route to initiate Google OAuth flow
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback route that Google will redirect to after authentication
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  authController.googleAuthCallback
);

// Get current logged-in user
router.get('/me', authMiddleware, authController.getCurrentUser);

// Retrieve JWT token from cookie (for clients to use as Bearer when needed)
router.get('/token', authMiddleware, authController.getToken);

// Logout Route
router.post('/logout', authMiddleware, authController.logout);

export default router;