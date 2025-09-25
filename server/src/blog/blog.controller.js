// server/src/blog/blog.controller.js
import { prisma } from "../config/database.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- AI setup ---
let genAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// --- Helpers ---
const generateSlug = (title) =>
  title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

const estimateReadTime = (content) =>
  Math.ceil(content.split(/\s+/).length / 200);

const generateSummary = async (content) => {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(
      `Summarize in 2-3 sentences:\n\n${content}`
    );
    return (await result.response).text();
  } catch (err) {
    console.error("generateSummary error:", err);
    return null;
  }
};

// --- Controllers ---

/**
 * Tags
 */
export const getTags = async (req, res) => {
  const tags = await prisma.blog.findMany({
    where: { isPublished: true },
    select: { tags: true },
  });

  const counts = tags
    .flatMap((b) => b.tags)
    .reduce((acc, t) => ((acc[t] = (acc[t] || 0) + 1), acc), {});

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));

  res.json({ success: true, data: { tags: sorted } });
};

/**
 * All blogs (public)
 */
export const getAllBlogs = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    tag,
    author,
    featured,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    isPublished: true,
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ],
    }),
    ...(tag && { tags: { has: tag } }),
    ...(featured === "true" && { isFeatured: true }),
    ...(author && {
      author: { name: { contains: author, mode: "insensitive" } },
    }),
  };

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        _count: { select: { likes: true, bookmarks: true, comments: true } },
      },
      orderBy: { [sortBy]: sortOrder },
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
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
};

/**
 * Blog by slug
 */
export const getBlogBySlug = async (req, res) => {
  const { slug } = req.params;

  const blog = await prisma.blog.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      _count: { select: { likes: true, bookmarks: true, comments: true } },
    },
  });

  if (!blog)
    return res.status(404).json({ success: false, message: "Blog not found" });

  if (
    !blog.isPublished &&
    (!req.user || (req.user.id !== blog.authorId && req.user.role !== "ADMIN"))
  ) {
    return res.status(404).json({ success: false, message: "Blog not found" });
  }

  await prisma.blog.update({
    where: { id: blog.id },
    data: { viewCount: { increment: 1 } },
  });

  let userInteractions = null;
  if (req.user) {
    const [like, bookmark] = await Promise.all([
      prisma.like.findUnique({
        where: { userId_blogId: { userId: req.user.id, blogId: blog.id } },
      }),
      prisma.bookmark.findUnique({
        where: { userId_blogId: { userId: req.user.id, blogId: blog.id } },
      }),
    ]);
    userInteractions = { liked: !!like, bookmarked: !!bookmark };
  }

  res.json({
    success: true,
    data: { blog: { ...blog, viewCount: blog.viewCount + 1 }, userInteractions },
  });
};

/**
 * Create blog
 */
export const createBlog = async (req, res) => {
  const {
    title,
    content,
    excerpt,
    coverImage,
    tags = [],
    isPublished = false,
    isFeatured = false,
  } = req.body;

  if (!title || !content)
    return res
      .status(400)
      .json({ success: false, message: "Title & content required" });

  let slug = generateSlug(title);
  if (await prisma.blog.findUnique({ where: { slug } }))
    slug = `${slug}-${Date.now()}`;

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
      isFeatured: req.user.role === "ADMIN" ? isFeatured : false,
      readTime: estimateReadTime(content),
      authorId: req.user.id,
    },
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      _count: { select: { likes: true, bookmarks: true, comments: true } },
    },
  });

  res
    .status(201)
    .json({ success: true, message: "Blog created", data: { blog } });
};

/**
 * Update blog
 */
export const updateBlog = async (req, res) => {
  const { id } = req.params;
  const { title, content, excerpt, coverImage, tags, isPublished, isFeatured } =
    req.body;

  const updateData = {};
  if (title !== undefined) {
    updateData.title = title;
    updateData.slug = generateSlug(title);
  }
  if (content !== undefined) {
    updateData.content = content;
    updateData.readTime = estimateReadTime(content);
    updateData.summary = await generateSummary(content);
  }
  if (excerpt !== undefined) updateData.excerpt = excerpt;
  if (coverImage !== undefined) updateData.coverImage = coverImage;
  if (tags !== undefined) updateData.tags = tags;
  if (isPublished !== undefined) updateData.isPublished = isPublished;
  if (isFeatured !== undefined && req.user.role === "ADMIN")
    updateData.isFeatured = isFeatured;

  const blog = await prisma.blog.update({
    where: { id },
    data: updateData,
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      _count: { select: { likes: true, bookmarks: true, comments: true } },
    },
  });

  res.json({ success: true, message: "Blog updated", data: { blog } });
};

/**
 * Delete blog
 */
export const deleteBlog = async (req, res) => {
  await prisma.blog.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Blog deleted" });
};

/**
 * Like / Unlike blog (with notification)
 */
export const toggleLike = async (req, res) => {
  const { id: blogId } = req.params;
  const userId = req.user.id;

  const blog = await prisma.blog.findUnique({ where: { id: blogId } });
  if (!blog)
    return res.status(404).json({ success: false, message: "Blog not found" });

  const existingLike = await prisma.like.findUnique({
    where: { userId_blogId: { userId, blogId } },
  });

  let message;
  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } });
    message = "Blog unliked successfully";
  } else {
    await prisma.like.create({ data: { userId, blogId } });

    if (blog.authorId !== userId) {
      await prisma.notification.create({
        data: {
          type: "LIKE",
          message: `${req.user.name} liked your blog "${blog.title}"`,
          senderId: userId,
          recipientId: blog.authorId,
        },
      });
    }

    message = "Blog liked successfully";
  }

  const likeCount = await prisma.like.count({ where: { blogId } });

  res.status(200).json({
    success: true,
    message,
    data: { liked: !existingLike, likeCount },
  });
};

/**
 * Bookmark / Unbookmark blog
 */
export const toggleBookmark = async (req, res) => {
  const { id: blogId } = req.params;
  const userId = req.user.id;

  const blog = await prisma.blog.findUnique({ where: { id: blogId } });
  if (!blog)
    return res.status(404).json({ success: false, message: "Blog not found" });

  const existing = await prisma.bookmark.findUnique({
    where: { userId_blogId: { userId, blogId } },
  });

  let message;
  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    message = "Bookmark removed";
  } else {
    await prisma.bookmark.create({ data: { userId, blogId } });
    message = "Blog bookmarked";
  }

  res.json({
    success: true,
    message,
    data: { bookmarked: !existing },
  });
};

/**
 * Get my blogs (auth)
 */
export const getMyBlogs = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    authorId: req.user.id,
    ...(status ? { isPublished: status === "published" } : {}),
  };

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      include: {
        _count: { select: { likes: true, bookmarks: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
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
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
};

/**
 * Comments
 */
export const createComment = async (req, res) => {
  const { content } = req.body;
  const blogId = req.params.id;
  const userId = req.user.id;

  if (!content)
    return res
      .status(400)
      .json({ success: false, message: "Comment content required" });

  const comment = await prisma.comment.create({
    data: { content, blogId, userId },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });

  res.status(201).json({ success: true, data: { comment } });
};

export const getComments = async (req, res) => {
  const blogId = req.params.id;
  const comments = await prisma.comment.findMany({
    where: { blogId },
    include: { user: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
  });

  res.json({ success: true, data: { comments } });
};
