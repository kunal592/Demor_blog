import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || (req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : null);

    if (!token) return res.status(401).json({ success: false, message: 'Access token required' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    if (!decoded || !decoded.userId) return res.status(401).json({ success: false, message: 'Invalid token payload' });

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, avatar: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'User not found or inactive' });

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') return res.status(403).json({ success: false, message: 'Admin required' });
  next();
};

export const requireBlogAuthor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await prisma.blog.findUnique({ where: { id }, select: { authorId: true } });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    if (req.user.role !== 'ADMIN' && blog.authorId !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    next();
  } catch (err) {
    console.error('requireBlogAuthor error', err);
    res.status(500).json({ success: false, message: 'Authorization failed' });
  }
};
