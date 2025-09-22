import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  getAdminStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllBlogs,
  updateBlog,
  deleteBlog,
  getModerationQueue,
  moderateComment
} from '../controllers/admin.controller.js';

const router = express.Router();

// Middleware for all admin routes
router.use(authenticate);
router.use(requireAdmin);

// Routes
router.get('/stats', asyncHandler(getAdminStats));
router.get('/users', asyncHandler(getAllUsers));
router.put('/users/:id', asyncHandler(updateUser));
router.delete('/users/:id', asyncHandler(deleteUser));
router.get('/blogs', asyncHandler(getAllBlogs));
router.put('/blogs/:id', asyncHandler(updateBlog));
router.delete('/blogs/:id', asyncHandler(deleteBlog));
router.get('/moderation', asyncHandler(getModerationQueue));
router.put('/comments/:id', asyncHandler(moderateComment));

export { router as adminRoutes };
