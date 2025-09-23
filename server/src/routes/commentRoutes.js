import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createComment, likeComment } from '../controllers/commentController.js';

const router = express.Router({ mergeParams: true });

// All routes are protected
router.use(protect);

router.route('/').post(createComment);
router.route('/:commentId/like').post(likeComment);

export { router as commentRoutes };
