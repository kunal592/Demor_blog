
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

// refreshes the token
router.post('/refresh', asyncHandler(refreshToken));
// gets user profile
router.get('/me', authenticate, asyncHandler(getProfile));
// logs out the user
router.post('/logout', authenticate, asyncHandler(logoutUser));

export { router as authRoutes };
