import { prisma } from '../config/database.js';

// @desc    Create a new comment
// @route   POST /api/blogs/:slug/comments
// @access  Private
export const createComment = async (req, res, next) => {
  try {
    const { content, parentId } = req.body;
    const { slug } = req.params;

    const blog = await prisma.blog.findUnique({
      where: { slug },
      select: { id: true, authorId: true },
    });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        blogId: blog.id,
        userId: req.user.id,
        parentId,
      },
    });

    // Create a notification for the blog author
    if (blog.authorId !== req.user.id) {
      await prisma.notification.create({
        data: {
          type: parentId ? 'COMMENT_REPLY' : 'NEW_COMMENT',
          userId: blog.authorId,
          actorId: req.user.id,
          blogId: blog.id,
          commentId: comment.id,
        },
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

// @desc    Like a comment
// @route   POST /api/blogs/:slug/comments/:commentId/like
// @access  Private
export const likeComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true, blog: { select: { id: true } } },
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const existingLike = await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId: req.user.id, commentId } },
    });

    if (existingLike) {
      // User has already liked the comment, so unlike it
      await prisma.commentLike.delete({
        where: { id: existingLike.id },
      });

      return res.status(200).json({ message: 'Comment unliked' });
    }

    // Like the comment
    await prisma.commentLike.create({
      data: {
        userId: req.user.id,
        commentId,
      },
    });

    // Create a notification for the comment author
    if (comment.userId !== req.user.id) {
      await prisma.notification.create({
        data: {
          type: 'COMMENT_LIKE',
          userId: comment.userId,
          actorId: req.user.id,
          blogId: comment.blog.id,
          commentId,
        },
      });
    }

    res.status(201).json({ message: 'Comment liked' });
  } catch (error) {
    next(error);
  }
};




//notification
// comment.controller.js
export const createComment = async (req, res) => {
  const { content } = req.body;
  const { id: blogId } = req.params;
  const userId = req.user.id;

  if (!content) {
    return res.status(400).json({ success: false, message: 'Comment content is required' });
  }

  const blog = await prisma.blog.findUnique({ where: { id: blogId } });
  if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

  try {
    const comment = await prisma.comment.create({
      data: { content, blogId, userId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    // 🔔 Notify blog author
    if (blog.authorId !== userId) {
      await prisma.notification.create({
        data: {
          type: 'COMMENT',
          message: `${req.user.name} commented on your blog "${blog.title}"`,
          senderId: userId,
          recipientId: blog.authorId,
        },
      });
    }

    res.status(201).json({ success: true, data: { comment } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};
