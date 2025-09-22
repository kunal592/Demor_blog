
import express from 'express';
import passport from 'passport';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import {
  googleLoginCallback,
  refreshToken,
  getProfile,
  logoutUser,
} from '../controllers/auth.controller.js';

const router = express.Router();

// Redirect to Google for authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback URL
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }), // Redirect to login on failure
  asyncHandler(googleLoginCallback) // Handle successful authentication
);

router.post('/refresh', asyncHandler(refreshToken));
router.get('/me', authenticate, asyncHandler(getProfile));
router.post('/logout', authenticate, asyncHandler(logoutUser));

export { router as authRoutes };
