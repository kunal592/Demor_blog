
/**
 * Blog routes for CRUD operations, likes, bookmarks, and interactions
 */
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../config/database.js';
import { authenticate, requireBlogAuthor } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { handleValidationErrors, blogQueryValidators, blogIdValidator, blogSlugValidator, createBlogValidators, updateBlogValidators, userBlogQueryValidators } from '../middleware/validators.js';

const router = express.Router();

// --- AI setup ---
let genAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// --- Helpers ---
const generateSlug = (title) =>
  title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

const estimateReadTime = (content) => Math.ceil(content.split(/\s+/).length / 200);

const generateSummary = async (content) => {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(
      `Please summarize this blog in 2-3 sentences:\n\n${content}`
    );
    return (await result.response).text();
  } catch {
    return null;
  }
};


// --- Get all tags ---
router.get(
  '/tags',
  asyncHandler(async (req, res) => {
    const tags = await prisma.blog.findMany({
      where: { isPublished: true },
      select: { tags: true },
    });
    const tagCounts = tags.flatMap(b => b.tags).reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});
    const sortedTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([tag, count]) => ({ tag, count }));

    res.json({ success: true, data: { tags: sortedTags } });
  })
);


// --- Get blogs ---
router.get(
  '/',
  blogQueryValidators,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, tag, author, featured, sortBy = 'createdAt', sortOrder = 'desc' } =
      req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      isPublished: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ],
      }),
      ...(tag && { tags: { has: tag } }),
      ...(author && { author: { name: { contains: author, mode: 'insensitive' } } }),
      ...(featured === 'true' && { isFeatured: true }),
    };
    
    const allowedSortBy = ['createdAt', 'updatedAt', 'viewCount', 'likes', 'comments'];
    const safeSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'desc';
    
    const orderBy =
      safeSortBy === 'likes' || safeSortBy === 'comments'
        ? { [safeSortBy]: { _count: safeSortOrder } }
        : { [safeSortBy]: safeSortOrder };


    const [blogs, totalCount] = await Promise.all([
      prisma.blog.findMany({
        where,
        include: { author: { select: { id: true, name: true, avatar: true } }, _count: true },
        orderBy,
        skip,
        take: parseInt(limit),
      }),
      prisma.blog.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit)),
        },
      },
    });
  })
);

// --- Get blog by slug ---
router.get(
  '/:slug',
  blogSlugValidator,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const blog = await prisma.blog.findUnique({
      where: { slug },
      include: { author: { select: { id: true, name: true, avatar: true } }, _count: true },
    });

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    if (!blog.isPublished && (!req.user || (req.user.id !== blog.authorId && req.user.role !== 'ADMIN'))) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    await prisma.blog.update({ where: { id: blog.id }, data: { viewCount: { increment: 1 } } });

    let userInteractions = null;
    if (req.user) {
      const [like, bookmark] = await Promise.all([
        prisma.like.findUnique({ where: { userId_blogId: { userId: req.user.id, blogId: blog.id } } }),
        prisma.bookmark.findUnique({ where: { userId_blogId: { userId: req.user.id, blogId: blog.id } } }),
      ]);
      userInteractions = { liked: !!like, bookmarked: !!bookmark };
    }

    res.json({
      success: true,
      data: {
        blog: { ...blog, viewCount: blog.viewCount + 1 },
        userInteractions,
      },
    });
  })
);

// --- Create blog ---
router.post(
  '/',
  authenticate,
  createBlogValidators,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { title, content, excerpt, coverImage, tags = [], isPublished = false, isFeatured = false } = req.body;

    let slug = generateSlug(title);
    if (await prisma.blog.findUnique({ where: { slug } })) slug += `-${Date.now()}`;

    const summary = await generateSummary(content);
    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        summary,
        coverImage,
        tags,
        isPublished,
        isFeatured: req.user.role === 'ADMIN' ? isFeatured : false,
        readTime: estimateReadTime(content),
        authorId: req.user.id,
      },
      include: { author: { select: { id: true, name: true, avatar: true } }, _count: true },
    });

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: { blog },
    });
  })
);

// --- Update blog ---
router.put(
  '/:id',
  authenticate,
  requireBlogAuthor,
  updateBlogValidators,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, content, excerpt, coverImage, tags, isPublished, isFeatured } = req.body;

    const updateData = {};
    if (title) {
      updateData.title = title;
      updateData.slug = generateSlug(title);
    }
    if (content) {
      updateData.content = content;
      updateData.readTime = estimateReadTime(content);
      updateData.summary = await generateSummary(content);
    }
    if (excerpt) updateData.excerpt = excerpt;
    if (coverImage) updateData.coverImage = coverImage;
    if (tags) updateData.tags = tags;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (isFeatured !== undefined && req.user.role === 'ADMIN') updateData.isFeatured = isFeatured;

    const blog = await prisma.blog.update({
      where: { id },
      data: updateData,
      include: { author: { select: { id: true, name: true, avatar: true } }, _count: true },
    });

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: { blog },
    });
  })
);

// --- Delete blog ---
router.delete(
  '/:id',
  authenticate,
  requireBlogAuthor,
  blogIdValidator,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    await prisma.blog.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Blog deleted successfully' });
  })
);

// --- Like blog ---
router.post(
  '/:id/like',
  authenticate,
  blogIdValidator,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const blog = await prisma.blog.findUnique({ where: { id } });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    const existingLike = await prisma.like.findUnique({
      where: { userId_blogId: { userId: req.user.id, blogId: id } },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      return res.json({
        success: true,
        message: 'Blog unliked successfully',
        data: { liked: false, likeCount: await prisma.like.count({ where: { blogId: id } }) },
      });
    }

    await prisma.like.create({ data: { userId: req.user.id, blogId: id } });
    res.json({
      success: true,
      message: 'Blog liked successfully',
      data: { liked: true, likeCount: await prisma.like.count({ where: { blogId: id } }) },
    });
  })
);

// --- Bookmark blog ---
router.post(
  '/:id/bookmark',
  authenticate,
  blogIdValidator,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const blog = await prisma.blog.findUnique({ where: { id } });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    const existingBookmark = await prisma.bookmark.findUnique({
      where: { userId_blogId: { userId: req.user.id, blogId: id } },
    });

    if (existingBookmark) {
      await prisma.bookmark.delete({ where: { id: existingBookmark.id } });
      return res.json({ success: true, message: 'Bookmark removed', data: { bookmarked: false } });
    }

    await prisma.bookmark.create({ data: { userId: req.user.id, blogId: id } });
    res.json({ success: true, message: 'Blog bookmarked', data: { bookmarked: true } });
  })
);

// --- User's own blogs ---
router.get(
  '/me/posts',
  authenticate,
  userBlogQueryValidators,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { authorId: req.user.id, ...(status && { isPublished: status === 'published' }) };
    const [blogs, totalCount] = await Promise.all([
      prisma.blog.findMany({ where, include: { _count: true }, orderBy: { createdAt: 'desc' }, skip, take: parseInt(limit) }),
      prisma.blog.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit)),
        },
      },
    });
  })
);

export { router as blogRoutes };
