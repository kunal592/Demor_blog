import { prisma } from '../config/database.js';
 /* Public profile by userId
 */
export const getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
        followers: {
          select: {
            followerId: true,
            follower: { select: { id: true, name: true, avatar: true } },
          },
        },
        following: {
          select: {
            followingId: true,
            following: { select: { id: true, name: true, avatar: true } },
          },
        },
        blogs: {
          select: {
            id: true,
            title: true,
            slug: true,
            content: true,
            createdAt: true,
            _count: { select: { likes: true, bookmarks: true, comments: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: { user } });
  } catch (err) {
    console.error("getUserById error", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


/**
 * Get user's likes
 */
export const getUserLikes = async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page ?? '1');
  const limit = parseInt(req.query.limit ?? '10');
  const skip = (page - 1) * limit;
  try {
    const [likes, totalCount] = await Promise.all([
      prisma.like.findMany({
        where: { userId },
        include: { blog: { include: { author: { select: { id: true, name: true, avatar: true } }, _count: { select: { likes: true, bookmarks: true, comments: true } } } } },
        orderBy: { createdAt: 'desc' }, skip, take: limit,
      }),
      prisma.like.count({ where: { userId } }),
    ]);
    const blogs = likes.map(l => l.blog);
    res.json({ success: true, data: { blogs, pagination: { page, limit, total: totalCount, pages: Math.ceil(totalCount / limit) } } });
  } catch (err) {
    console.error('getUserLikes error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get user bookmarks
 */
export const getUserBookmarks = async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page ?? '1');
  const limit = parseInt(req.query.limit ?? '10');
  const skip = (page - 1) * limit;
  try {
    const [bookmarks, totalCount] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId },
        include: { blog: { include: { author: { select: { id: true, name: true, avatar: true } }, _count: { select: { likes: true, bookmarks: true, comments: true } } } } },
        orderBy: { createdAt: 'desc' }, skip, take: limit,
      }),
      prisma.bookmark.count({ where: { userId } }),
    ]);
    const blogs = bookmarks.map(b => ({ ...b.blog, bookmarkedAt: b.createdAt }));
    res.json({ success: true, data: { blogs, pagination: { page, limit, total: totalCount, pages: Math.ceil(totalCount / limit) } } });
  } catch (err) {
    console.error('getUserBookmarks error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get user stats (blogs, likes, bookmarks, views)
 */
export const getUserStats = async (req, res) => {
  const userId = req.user.id;
  try {
    const [blogsCount, likesReceived, bookmarksReceived, likedCount, bookmarkedCount] = await Promise.all([
      prisma.blog.count({ where: { authorId: userId } }),
      prisma.like.count({ where: { blog: { authorId: userId } } }),
      prisma.bookmark.count({ where: { blog: { authorId: userId } } }),
      prisma.like.count({ where: { userId } }),
      prisma.bookmark.count({ where: { userId } }),
    ]);
    const viewsAgg = await prisma.blog.aggregate({ where: { authorId: userId }, _sum: { viewCount: true } });
    res.json({ success: true, data: { blogsPublished: blogsCount, totalViews: viewsAgg._sum.viewCount || 0, likesReceived, bookmarksReceived, blogsLiked: likedCount, blogsBookmarked: bookmarkedCount } });
  } catch (err) {
    console.error('getUserStats error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update profile (auth)
 */
export const updateUserProfile = async (req, res) => {
  const { name, avatar, bio } = req.body;
  if (!name && !avatar && bio === undefined) return res.status(400).json({ success: false, message: 'Nothing to update' });
  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { ...(name && { name }), ...(avatar && { avatar }), ...(bio !== undefined && { bio }) },
      select: { id: true, email: true, name: true, avatar: true, bio: true, role: true },
    });
    res.json({ success: true, message: 'Profile updated', data: { user: updated } });
  } catch (err) {
    console.error('updateUserProfile error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Dashboard (auth)
 */
export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const [blogsCount, likesReceived, bookmarksReceived, likedCount, bookmarkedCount] = await Promise.all([
      prisma.blog.count({ where: { authorId: userId } }),
      prisma.like.count({ where: { blog: { authorId: userId } } }),
      prisma.bookmark.count({ where: { blog: { authorId: userId } } }),
      prisma.like.count({ where: { userId } }),
      prisma.bookmark.count({ where: { userId } }),
    ]);
    const viewsAgg = await prisma.blog.aggregate({ where: { authorId: userId }, _sum: { viewCount: true } });
    const recentBlogs = await prisma.blog.findMany({
      where: { authorId: userId },
      include: { _count: { select: { likes: true, bookmarks: true, comments: true } } },
      orderBy: { createdAt: 'desc' }, take: 5,
    });
    const recentLikes = await prisma.like.findMany({ where: { userId }, include: { blog: { include: { author: { select: { id: true, name: true, avatar: true } } } } }, orderBy: { createdAt: 'desc' }, take: 5 });
    const recentBookmarks = await prisma.bookmark.findMany({ where: { userId }, include: { blog: { include: { author: { select: { id: true, name: true, avatar: true } } } } }, orderBy: { createdAt: 'desc' }, take: 5 });

    res.json({
      success: true,
      data: {
        stats: {
          blogsPublished: blogsCount,
          totalViews: viewsAgg._sum.viewCount || 0,
          likesReceived,
          bookmarksReceived,
          blogsLiked: likedCount,
          blogsBookmarked: bookmarkedCount,
        },
        recentBlogs,
        recentLikes: recentLikes.map(l => l.blog),
        recentBookmarks: recentBookmarks.map(b => b.blog),
      },
    });
  } catch (err) {
    console.error('getUserDashboard error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get user's blogs (auth)
 */
export const getUserBlogs = async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page ?? '1'); const limit = parseInt(req.query.limit ?? '10'); const skip = (page - 1) * limit;
  const where = { authorId: userId, ...(req.query.status ? { isPublished: req.query.status === 'published' } : {}) };
  try {
    const [blogs, totalCount] = await Promise.all([
      prisma.blog.findMany({ where, include: { _count: { select: { likes: true, bookmarks: true, comments: true } } }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.blog.count({ where }),
    ]);
    res.json({ success: true, data: { blogs, pagination: { page, limit, total: totalCount, pages: Math.ceil(totalCount / limit) } } });
  } catch (err) {
    console.error('getUserBlogs error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Follow / unfollow
 */
/**
 * Follow a user
 */
export const followUser = async (req, res) => {
  const { userId } = req.params;
  const followerId = req.user.id;

  if (userId === followerId) {
    return res.status(400).json({ success: false, message: "Cannot follow yourself" });
  }

  try {
    await prisma.follows.create({ data: { followerId, followingId: userId } });

    // 🔔 Create notification
    await prisma.notification.create({
      data: {
        type: "FOLLOW",
        message: `${req.user.name} started following you`,
        senderId: followerId,
        recipientId: userId,
      },
    });

    // Return updated followers
    const followers = await prisma.follows.findMany({
      where: { followingId: userId },
      include: { follower: { select: { id: true, name: true, avatar: true } } },
    });

    res.json({ success: true, data: { isFollowing: true, followers } });
  } catch (err) {
    console.error("followUser error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (req, res) => {
  const { userId } = req.params;
  const followerId = req.user.id;

  try {
    await prisma.follows.delete({
      where: { followerId_followingId: { followerId, followingId: userId } },
    });

    // Return updated followers
    const followers = await prisma.follows.findMany({
      where: { followingId: userId },
      include: { follower: { select: { id: true, name: true, avatar: true } } },
    });

    res.json({ success: true, data: { isFollowing: false, followers } });
  } catch (err) {
    console.error("unfollowUser error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
