import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../config/database.js';

// --- Gemini AI setup ---
let genAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// --- Helper functions ---

// Generate URL-friendly slug from blog title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Estimate blog reading time (200 WPM avg.)
const estimateReadTime = (content) => {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

// Generate AI-powered summary with Gemini (if API key is configured)
const generateSummary = async (content) => {
  if (!genAI) return null;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Summarize the following blog post in 2-3 sentences:\n\n${content}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini AI error:', error);
    return null;
  }
};

// --- Controllers ---

/**
 * Get all published blogs with pagination and filtering
 */
export const getAllBlogs = async (req, res) => {
  const { page = 1, limit = 10, search, tag, author, featured, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Build dynamic filter (search, tag, author, featured)
  const where = {
    isPublished: true,
    ...(search && { OR: [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } }
    ]}),
    ...(tag && { tags: { has: tag } }),
    ...(author && { author: { name: { contains: author, mode: 'insensitive' } } }),
    ...(featured === 'true' && { isFeatured: true })
  };

  const [blogs, totalCount] = await Promise.all([
    prisma.blog.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, avatar: true } },
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
    data: { blogs, pagination: { page: +page, limit: +limit, total: totalCount, pages: Math.ceil(totalCount / take) } }
  });
};

/**
 * Get single blog by slug
 */
export const getBlogBySlug = async (req, res) => {
  const { slug } = req.params;

  const blog = await prisma.blog.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      _count: { select: { likes: true, bookmarks: true, comments: true } }
    }
  });

  if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

  // Restrict access if unpublished and not author/admin
  if (!blog.isPublished && (!req.user || (req.user.id !== blog.authorId && req.user.role !== 'ADMIN'))) {
    return res.status(404).json({ success: false, message: 'Blog not found' });
  }

  // Increment views
  await prisma.blog.update({ where: { id: blog.id }, data: { viewCount: { increment: 1 } } });

  // Check user interactions (liked/bookmarked)
  let userInteractions = null;
  if (req.user) {
    const [like, bookmark] = await Promise.all([
      prisma.like.findUnique({ where: { userId_blogId: { userId: req.user.id, blogId: blog.id } } }),
      prisma.bookmark.findUnique({ where: { userId_blogId: { userId: req.user.id, blogId: blog.id } } })
    ]);
    userInteractions = { liked: !!like, bookmarked: !!bookmark };
  }

  res.status(200).json({ success: true, data: { blog: { ...blog, viewCount: blog.viewCount + 1 }, userInteractions } });
};

/**
 * Create new blog
 */
export const createBlog = async (req, res) => {
  const { title, content, excerpt, coverImage, tags = [], isPublished = false, isFeatured = false } = req.body;

  if (!title || !content) return res.status(400).json({ success: false, message: 'Title and content are required' });

  // Ensure unique slug
  let slug = generateSlug(title);
  if (await prisma.blog.findUnique({ where: { slug } })) slug = `${slug}-${Date.now()}`;

  const summary = await generateSummary(content);

  const blog = await prisma.blog.create({
    data: {
      title, slug, content, excerpt, summary, coverImage, tags,
      isPublished,
      isFeatured: req.user.role === 'ADMIN' ? isFeatured : false,
      readTime: estimateReadTime(content),
      authorId: req.user.id
    },
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      _count: { select: { likes: true, bookmarks: true, comments: true } }
    }
  });

  res.status(201).json({ success: true, message: 'Blog created successfully', data: { blog } });
};

/**
 * Update blog
 */
export const updateBlog = async (req, res) => {
  const { id } = req.params;
  const { title, content, excerpt, coverImage, tags, isPublished, isFeatured } = req.body;

  const updateData = {};
  if (title !== undefined) { updateData.title = title; updateData.slug = generateSlug(title); }
  if (content !== undefined) { updateData.content = content; updateData.readTime = estimateReadTime(content); updateData.summary = await generateSummary(content); }
  if (excerpt !== undefined) updateData.excerpt = excerpt;
  if (coverImage !== undefined) updateData.coverImage = coverImage;
  if (tags !== undefined) updateData.tags = tags;
  if (isPublished !== undefined) updateData.isPublished = isPublished;
  if (isFeatured !== undefined && req.user.role === 'ADMIN') updateData.isFeatured = isFeatured;

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
  await prisma.blog.delete({ where: { id: req.params.id } });
  res.status(200).json({ success: true, message: 'Blog deleted successfully' });
};

/**
 * Like/Unlike blog
 */
export const toggleLike = async (req, res) => {
  const { id: blogId } = req.params;
  const userId = req.user.id;

  const blog = await prisma.blog.findUnique({ where: { id: blogId } });
  if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

  const existingLike = await prisma.like.findUnique({ where: { userId_blogId: { userId, blogId } } });

  let message;
  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } });
    message = 'Blog unliked successfully';
  } else {
    await prisma.like.create({ data: { userId, blogId } });
    message = 'Blog liked successfully';
  }

  const likeCount = await prisma.like.count({ where: { blogId } });

  res.status(200).json({ success: true, message, data: { liked: !existingLike, likeCount } });
};

/**
 * Bookmark/Unbookmark blog
 */
export const toggleBookmark = async (req, res) => {
  const { id: blogId } = req.params;
  const userId = req.user.id;

  const blog = await prisma.blog.findUnique({ where: { id: blogId } });
  if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

  const existingBookmark = await prisma.bookmark.findUnique({ where: { userId_blogId: { userId, blogId } } });

  let message;
  if (existingBookmark) {
    await prisma.bookmark.delete({ where: { id: existingBookmark.id } });
    message = 'Bookmark removed successfully';
  } else {
    await prisma.bookmark.create({ data: { userId, blogId } });
    message = 'Blog bookmarked successfully';
  }

  res.status(200).json({ success: true, message, data: { bookmarked: !existingBookmark } });
};

/**
 * Get current user's own blogs
 */
export const getMyBlogs = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = { authorId: req.user.id, ...(status && { isPublished: status === 'published' }) };

  const [blogs, totalCount] = await Promise.all([
    prisma.blog.findMany({
      where,
      include: { _count: { select: { likes: true, bookmarks: true, comments: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    }),
    prisma.blog.count({ where })
  ]);

  res.status(200).json({
    success: true,
    data: { blogs, pagination: { page: +page, limit: +limit, total: totalCount, pages: Math.ceil(totalCount / take) } }
  });
};


/**
 * Create a new comment on a blog post
 */
export const createComment = async (req, res) => {
  const { content } = req.body;
  const { id: blogId } = req.params;
  const userId = req.user.id;

  if (!content) {
    return res.status(400).json({ success: false, message: 'Comment content is required' });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        blogId,
        userId,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });
    res.status(201).json({ success: true, data: { comment } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

/**
 * Get all comments for a blog post
 */
export const getComments = async (req, res) => {
  const { id: blogId } = req.params;
  try {
    const comments = await prisma.comment.findMany({
      where: { blogId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: { comments } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};
