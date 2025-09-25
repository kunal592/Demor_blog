import express from "express";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  getNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
} from "./notification.controller.js";

const router = express.Router();

// ✅ Get all notifications (paginated)
router.get("/", authenticate, asyncHandler(getNotifications));

// ✅ Get only unread notifications
router.get("/unread", authenticate, asyncHandler(getUnreadNotifications));

// ✅ Mark one notification as read
router.post("/:id/read", authenticate, asyncHandler(markAsRead));

// ✅ Mark all notifications as read
router.post("/read-all", authenticate, asyncHandler(markAllAsRead));

export { router as notificationRoutes };
