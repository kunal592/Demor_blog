import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, requireBlogAuthor } from '../middleware/auth.js';
import {
  getAllBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  toggleBookmark,
  getMyBlogs,
  createComment,
  getComments,
  getTags,
} from './blog.controller.js';

const router = express.Router();

router.get('/tags', asyncHandler(getTags));
router.get('/', asyncHandler(getAllBlogs));
router.get('/:slug', asyncHandler(getBlogBySlug));

// blog actions
router.post('/', authenticate, asyncHandler(createBlog));
router.put('/:id', authenticate, requireBlogAuthor, asyncHandler(updateBlog));
router.delete('/:id', authenticate, requireBlogAuthor, asyncHandler(deleteBlog));

// like & bookmark
router.post('/:id/like', authenticate, asyncHandler(toggleLike));
router.post('/:id/bookmark', authenticate, asyncHandler(toggleBookmark));

// comments for blog id (these routes are grouped under /api/blogs/:slug/comments in server)
router.post('/:id/comments', authenticate, asyncHandler(createComment));
router.get('/:id/comments', asyncHandler(getComments));

// user's own posts
router.get('/me/posts', authenticate, asyncHandler(getMyBlogs));

export { router as blogRoutes };
