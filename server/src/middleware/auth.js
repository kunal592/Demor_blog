/**
 * Authentication middleware for JWT
 * - Verifies `accessToken` from cookies (or Authorization header as fallback)
 * - Attaches user object to `req.user`
 * - Used in protected routes (like /auth/me, /blogs, /admin)
 */

import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';

// 🔐 Main authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    // --- 1. Get token ---
    let token = req.cookies.accessToken; // Preferred: from secure cookie
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace('Bearer ', ''); // Fallback
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // --- 2. Verify token ---
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET); // Valid + not expired?
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // --- 3. Fetch user from DB ---
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // --- 4. Attach user to request ---
    req.user = user;
    next(); // ✅ pass control to next route handler
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Admin-only middleware
 * - Ensures req.user.role === 'ADMIN'
 */
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

/**
 * Blog author check middleware
 * - Ensures user is either the blog's author or an admin
 */
export const requireBlogAuthor = async (req, res, next) => {
  try {
    const { id } = req.params; // Correctly get blog ID from URL

    const blog = await prisma.blog.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Allow ADMIN or blog author
    if (req.user.role !== 'ADMIN' && blog.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this blog'
      });
    }

    next(); // ✅ allow request
  } catch (error) {
    console.error('Author verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Authorization check failed'
    });
  }
};