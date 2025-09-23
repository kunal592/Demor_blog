
import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAdminStats,
} from './admin.controller.js';

const router = express.Router();

// Route to get all users
router.get('/users', asyncHandler(getAllUsers));

// Route to get a single user by ID
router.get('/users/:id', asyncHandler(getUserById));

// Route to update a user's role
router.put('/users/:id/role', asyncHandler(updateUserRole));

// Route to delete a user
router.delete('/users/:id', asyncHandler(deleteUser));

// Route to get dashboard statistics
router.get('/dashboard-stats', asyncHandler(getAdminStats));

export { router as adminRoutes };
