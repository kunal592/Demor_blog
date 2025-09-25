import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import {
  getUserById,
  getUserLikes,
  getUserBookmarks,
  getUserStats,
  updateUserProfile,
  getUserDashboard,
  getUserBlogs,
  followUser,
  unfollowUser,
} from "./user.controller.js";

const router = express.Router();

// Dashboard (authenticated)
router.get('/dashboard', authenticate, asyncHandler(getUserDashboard));

// Profile update (auth)
router.put('/profile', authenticate, asyncHandler(updateUserProfile));

// Likes, bookmarks, stats (auth)
router.get('/likes', authenticate, asyncHandler(getUserLikes));
router.get('/bookmarks', authenticate, asyncHandler(getUserBookmarks));
router.get('/stats', authenticate, asyncHandler(getUserStats));

// User's blogs (auth)
router.get('/blogs', authenticate, asyncHandler(getUserBlogs));

// Follow/unfollow (auth)
router.post('/:userId/follow', authenticate, asyncHandler(followUser));
router.delete('/:userId/unfollow', authenticate, asyncHandler(unfollowUser));

// Public profile (by id)
router.get('/:userId', asyncHandler(getUserById));

export { router as userRoutes };
