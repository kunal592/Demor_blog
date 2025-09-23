import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { createComment, likeComment } from './comment.controller.js';

const router = express.Router({ mergeParams: true });

// All routes are protected
router.use(authenticate);

router.route('/').post(createComment);
router.route('/:commentId/like').post(likeComment);

export { router as commentRoutes };
