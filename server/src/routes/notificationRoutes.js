import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

export { router as notificationRoutes };
