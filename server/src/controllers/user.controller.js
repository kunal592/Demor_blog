
import { prisma } from '../config/database.js';

/**
 * Get all blogs that the user has liked
 */
export const getUserLikes = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [likes, totalCount] = await Promise.all([
    prisma.like.findMany({
      where: { userId: req.user.id },
      include: {
        blog: {
          include: {
            author: { select: { id: true, name: true, avatar: true } },
            _count: { select: { likes: true, bookmarks: true, comments: true } }
          }
        }
      },
      orderBy: { blog: { createdAt: 'desc' } },
      skip,
      take
    }),
    prisma.like.count({ where: { userId: req.user.id } })
  ]);

  const likedBlogs = likes.map(like => like.blog);

  res.status(200).json({
    success: true,
    data: {
      blogs: likedBlogs,
      pagination: { page: +page, limit: +limit, total: totalCount, pages: Math.ceil(totalCount / take) }
    }
  });
};

/**
 * Get all blogs that the user has bookmarked
 */
export const getUserBookmarks = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [bookmarks, totalCount] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId: req.user.id },
      include: {
        blog: {
          include: {
            author: { select: { id: true, name: true, avatar: true } },
            _count: { select: { likes: true, bookmarks: true, comments: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    }),
    prisma.bookmark.count({ where: { userId: req.user.id } })
  ]);

  const bookmarkedBlogs = bookmarks.map(bookmark => ({
    ...bookmark.blog,
    bookmarkedAt: bookmark.createdAt
  }));

  res.status(200).json({
    success: true,
    data: {
      blogs: bookmarkedBlogs,
      pagination: { page: +page, limit: +limit, total: totalCount, pages: Math.ceil(totalCount / take) }
    }
  });
};

/**
 * Get statistics for the user (blogs, views, likes, bookmarks)
 */
export const getUserStats = async (req, res) => {
  const userId = req.user.id;

  const [blogsCount, likesReceived, bookmarksReceived, likedBlogs, bookmarkedBlogs] = await Promise.all([
    prisma.blog.count({ where: { authorId: userId } }),
    prisma.like.count({ where: { blog: { authorId: userId } } }),
    prisma.bookmark.count({ where: { blog: { authorId: userId } } }),
    prisma.like.count({ where: { userId } }),
    prisma.bookmark.count({ where: { userId } })
  ]);

  const totalViews = await prisma.blog.aggregate({
    where: { authorId: userId },
    _sum: { viewCount: true }
  });

  res.status(200).json({
    success: true,
    data: {
      blogsPublished: blogsCount,
      totalViews: totalViews._sum.viewCount || 0,
      likesReceived,
      bookmarksReceived,
      blogsLiked: likedBlogs,
      blogsBookmarked: bookmarkedBlogs
    }
  });
};

/**
 * Update user's own profile (name + avatar)
 */
export const updateUserProfile = async (req, res) => {
  const { name, avatar } = req.body;

  if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, ...(avatar && { avatar }) },
    select: { id: true, email: true, name: true, avatar: true, role: true }
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: updatedUser }
  });
};

/**
 * Get dashboard data for user (recent blogs, likes, bookmarks, stats)
 */
export const getUserDashboard = async (req, res) => {
  const userId = req.user.id;

  // Recent blogs authored by user
  const recentBlogs = await prisma.blog.findMany({
    where: { authorId: userId },
    include: { _count: { select: { likes: true, bookmarks: true, comments: true } } },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  // Recent liked blogs
  const recentLikes = await prisma.like.findMany({
    where: { userId },
    include: { blog: { include: { author: { select: { id: true, name: true, avatar: true } } } } },
    orderBy: { blog: { createdAt: 'desc' } },
    take: 5
  });

  // Recent bookmarked blogs
  const recentBookmarks = await prisma.bookmark.findMany({
    where: { userId },
    include: { blog: { include: { author: { select: { id: true, name: true, avatar: true } } } } },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  // Stats: blogs, likes, bookmarks, views
  const stats = await Promise.all([
    prisma.blog.count({ where: { authorId: userId } }),
    prisma.like.count({ where: { userId } }),
    prisma.bookmark.count({ where: { userId } }),
    prisma.blog.aggregate({ where: { authorId: userId }, _sum: { viewCount: true } })
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalBlogs: stats[0],
        totalLikes: stats[1],
        totalBookmarks: stats[2],
        totalViews: stats[3]._sum.viewCount || 0
      },
      recentBlogs,
      recentLikes: recentLikes.map(like => like.blog),
      recentBookmarks: recentBookmarks.map(bookmark => bookmark.blog)
    }
  });
};

/**
 * Get all blogs authored by the user
 */
export const getUserBlogs = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [blogs, totalCount] = await Promise.all([
    prisma.blog.findMany({
      where: { authorId: req.user.id },
      include: {
        _count: { select: { likes: true, bookmarks: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.blog.count({ where: { authorId: req.user.id } }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      blogs,
      pagination: { page: +page, limit: +limit, total: totalCount, pages: Math.ceil(totalCount / take) },
    },
  });
};
