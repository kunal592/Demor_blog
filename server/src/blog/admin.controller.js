
import { prisma } from '../config/database.js';

/**
 * Get admin dashboard statistics
 */
export const getAdminStats = async (req, res) => {
  const [
    totalUsers,
    totalBlogs,
    publishedBlogs,
    draftBlogs,
    totalLikes,
    totalBookmarks,
    totalComments,
    recentUsers,
    recentBlogs,
    topBlogs
  ] = await Promise.all([
    prisma.user.count(),
    prisma.blog.count(),
    prisma.blog.count({ where: { isPublished: true } }),
    prisma.blog.count({ where: { isPublished: false } }),
    prisma.like.count(),
    prisma.bookmark.count(),
    prisma.comment.count(),
    prisma.user.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, avatar: true, createdAt: true, role: true }
    }),
    prisma.blog.findMany({
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } },
        _count: { select: { likes: true, bookmarks: true, comments: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    prisma.blog.findMany({
      where: { isPublished: true },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        _count: { select: { likes: true, bookmarks: true, comments: true } }
      },
      orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
      take: 5
    })
  ]);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const [currentMonthUsers, previousMonthUsers] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } })
  ]);

  const userGrowth = previousMonthUsers === 0 ? 100 :
    ((currentMonthUsers - previousMonthUsers) / previousMonthUsers) * 100;

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalUsers, totalBlogs, publishedBlogs, draftBlogs,
        totalLikes, totalBookmarks, totalComments,
        userGrowth: Math.round(userGrowth * 100) / 100
      },
      recentActivity: { recentUsers, recentBlogs, topBlogs }
    }
  });
};

/**
 * Get all users with pagination and filtering
 */
export const getAllUsers = async (req, res) => {
  const { page = 1, limit = 10, search, role, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {
    ...(search && { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }),
    ...(role && { role }),
    ...(isActive !== undefined && { isActive: isActive === 'true' })
  };

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, email: true, name: true, avatar: true, role: true, isActive: true, createdAt: true,
        _count: { select: { blogs: true, likes: true, bookmarks: true } }
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take
    }),
    prisma.user.count({ where })
  ]);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: totalCount, pages: Math.ceil(totalCount / take) }
    }
  });
};

/**
 * Get user by ID
 */
export const getUserById = async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: { blogs: true, likes: true, bookmarks: true, comments: true },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({ success: true, data: { user } });
};


/**
 * Update user role or status
 */
export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role, isActive } = req.body;

  if (id === req.user.id && isActive === false) {
    return res.status(400).json({ success: false, message: 'Cannot deactivate your own account' });
  }

  const updateData = {};
  if (role !== undefined) updateData.role = role;
  if (isActive !== undefined) updateData.isActive = isActive;

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, email: true, name: true, avatar: true, role: true, isActive: true, createdAt: true }
  });

  res.status(200).json({ success: true, message: 'User updated successfully', data: { user: updatedUser } });
};

/**
 * Delete user
 */
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) {
    return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
  }
  await prisma.user.delete({ where: { id } });
  res.status(200).json({ success: true, message: 'User deleted successfully' });
};

/**
 * Get all blogs with admin privileges
 */
export const getAllBlogs = async (req, res) => {
  const { page = 1, limit = 10, search, author, isPublished, isFeatured, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {
    ...(search && { OR: [{ title: { contains: search, mode: 'insensitive' } }, { content: { contains: search, mode: 'insensitive' } }] }),
    ...(author && { author: { name: { contains: author, mode: 'insensitive' } } }),
    ...(isPublished !== undefined && { isPublished: isPublished === 'true' }),
    ...(isFeatured !== undefined && { isFeatured: isFeatured === 'true' } )
  };

  const [blogs, totalCount] = await Promise.all([
    prisma.blog.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } },
        _count: { select: { likes: true, bookmarks: true, comments: true } }
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take
    }),
    prisma.blog.count({ where })
  ]);

  res.status(200).json({
    success: true,
    data: {
      blogs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: totalCount, pages: Math.ceil(totalCount / take) }
    }
  });
};

/**
 * Update blog
 */
export const updateBlog = async (req, res) => {
  const { id } = req.params;
  const { isPublished, isFeatured, tags } = req.body;

  const updateData = {};
  if (isPublished !== undefined) updateData.isPublished = isPublished;
  if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
  if (tags !== undefined) updateData.tags = tags;

  const blog = await prisma.blog.update({
    where: { id },
    data: updateData,
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      _count: { select: { likes: true, bookmarks: true, comments: true } }
    }
  });

  res.status(200).json({ success: true, message: 'Blog updated successfully', data: { blog } });
};

/**
 * Delete blog
 */
export const deleteBlog = async (req, res) => {
  const { id } = req.params;
  await prisma.blog.delete({ where: { id } });
  res.status(200).json({ success: true, message: 'Blog deleted successfully' });
};

/**
 * Get content moderation queue
 */
export const getModerationQueue = async (req, res) => {
  const { type = 'all' } = req.query;
  const result = {};

  if (type === 'all' || type === 'comments') {
    result.comments = await prisma.comment.findMany({
      where: { isApproved: false },
      include: { user: { select: { id: true, name: true, avatar: true } }, blog: { select: { id: true, title: true, slug: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  if (type === 'all' || type === 'reports') {
    result.reports = [];
  }

  res.status(200).json({ success: true, data: result });
};

/**
 * Approve/reject comment
 */
export const moderateComment = async (req, res) => {
  const { id } = req.params;
  const { isApproved } = req.body;

  const comment = await prisma.comment.update({
    where: { id },
    data: { isApproved },
    include: { user: { select: { id: true, name: true, avatar: true } }, blog: { select: { id: true, title: true, slug: true } } }
  });

  res.status(200).json({ success: true, message: `Comment ${isApproved ? 'approved' : 'rejected'} successfully`, data: { comment } });
};
