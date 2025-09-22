
import express from 'express';
import passport from 'passport';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import {
  googleLoginCallback,
  refreshToken,
  getProfile,
  logoutUser,
  loginFailure,
} from '../controllers/auth.controller.js';

const router = express.Router();

// Redirect to Google for authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback URL
router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/auth/login-failure'
  }), 
  asyncHandler(googleLoginCallback) 
);

// refreshes the token
router.post('/refresh', asyncHandler(refreshToken));
// gets user profile
router.get('/me', authenticate, asyncHandler(getProfile));
// logs out the user
router.post('/logout', authenticate, asyncHandler(logoutUser));
// handles failed login attempts
router.get('/login-failure', loginFailure);

export { router as authRoutes };
