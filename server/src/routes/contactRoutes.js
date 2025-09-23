import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  createContactRequest,
  getContactRequests,
  updateContactRequestStatus,
} from '../controllers/contact.controller.js';

const router = express.Router();

// Public route to submit a contact request
router.post('/', asyncHandler(createContactRequest));

// Admin routes to manage contact requests
router.get('/', authenticate, requireAdmin, asyncHandler(getContactRequests));
router.put('/:id', authenticate, requireAdmin, asyncHandler(updateContactRequestStatus));

export { router as contactRoutes };
