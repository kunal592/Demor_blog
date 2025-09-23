
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  getUserLikes,
  getUserBookmarks,
  getUserStats,
  updateUserProfile,
  getUserDashboard,
  getUserBlogs,
  followUser,
  unfollowUser
} from '../controllers/user.controller.js';

const router = express.Router();

// Likes
router.get('/likes', authenticate, asyncHandler(getUserLikes));

// Bookmarks
router.get('/bookmarks', authenticate, asyncHandler(getUserBookmarks));

// Stats
router.get('/stats', authenticate, asyncHandler(getUserStats));

// Profile update
router.put('/profile', authenticate, asyncHandler(updateUserProfile));

// Dashboard
router.get('/dashboard', authenticate, asyncHandler(getUserDashboard));

// Blogs
router.get('/blogs', authenticate, asyncHandler(getUserBlogs));

// Follow
router.post('/:userId/follow', authenticate, asyncHandler(followUser));
router.delete('/:userId/unfollow', authenticate, asyncHandler(unfollowUser));

export { router as userRoutes };
