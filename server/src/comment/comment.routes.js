import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getComments, createComment } from '../blog/blog.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// GET /api/blogs/:slug/comments -> but our blog controllers use blog id. You might map slug->id in frontend or implement lookup
router.get('/', asyncHandler(getComments));
router.post('/', authenticate, asyncHandler(createComment));

export { router as commentRoutes };
