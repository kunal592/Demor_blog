/**
 * Authentication routes for Google OAuth and JWT token management
 * Features:
 *  - Login with Google (OAuth2)
 *  - Issue JWT access & refresh tokens
 *  - Refresh expired access tokens
 *  - Logout and clear cookies
 */

import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import {
  googleLogin,
  refreshToken,
  getProfile,
  logoutUser,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/google', asyncHandler(googleLogin));
router.post('/refresh', asyncHandler(refreshToken));
router.get('/me', authenticate, asyncHandler(getProfile));
router.post('/logout', authenticate, asyncHandler(logoutUser));

export { router as authRoutes };
