import { prisma } from "../config/database.js";

/**
 * Get all notifications (paginated)
 */
export const getNotifications = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [notifications, totalCount] = await Promise.all([
    prisma.notification.findMany({
      where: { recipientId: req.user.id },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: parseInt(limit),
    }),
    prisma.notification.count({ where: { recipientId: req.user.id } }),
  ]);

  res.json({
    success: true,
    data: {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit)),
      },
    },
  });
};

/**
 * Get unread notifications
 */
export const getUnreadNotifications = async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { recipientId: req.user.id, isRead: false },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
  });

  res.json({ success: true, data: { notifications } });
};

/**
 * Mark one notification as read
 */
export const markAsRead = async (req, res) => {
  const { id } = req.params;

  const notification = await prisma.notification.updateMany({
    where: { id, recipientId: req.user.id },
    data: { isRead: true },
  });

  if (!notification.count) {
    return res.status(404).json({ success: false, message: "Notification not found" });
  }

  res.json({ success: true, message: "Notification marked as read" });
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req, res) => {
  await prisma.notification.updateMany({
    where: { recipientId: req.user.id, isRead: false },
    data: { isRead: true },
  });

  res.json({ success: true, message: "All notifications marked as read" });
};
