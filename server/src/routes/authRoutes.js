/**
 * Authentication routes for Google OAuth and JWT token management
 * Features:
 *  - Login with Google (OAuth2)
 *  - Issue JWT access & refresh tokens
 *  - Refresh expired access tokens
 *  - Logout and clear cookies
 */

import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * 🔑 Helper: Generate JWT tokens
 * - Access token: short-lived (15m)
 * - Refresh token: long-lived (7d)
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * 🔑 Helper: Set secure cookies
 * - Tokens stored in HttpOnly cookies → protected from JS access
 * - `secure` & `sameSite` depend on environment (dev vs prod)
 */
const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,          // HTTPS only in production
    sameSite: isProd ? 'strict' : 'lax',
    path: '/',
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * 📌 Login with Google
 * POST /api/auth/google
 */
router.post(
  '/google',
  asyncHandler(async (req, res) => {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required' });
    }

    try {
      // Verify Google ID token
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const { sub: googleId, email, name, picture } = ticket.getPayload();

      // --- Check if user exists ---
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        // New user → assign role
        const role = email === process.env.ADMIN_EMAIL ? 'ADMIN' : 'USER';
        user = await prisma.user.create({
          data: { email, name, avatar: picture, googleId, role },
        });
      } else {
        // Update profile if changed
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, avatar: picture, name },
        });
      }

      // --- Issue tokens ---
      const { accessToken, refreshToken } = generateTokens(user.id);

      // Save refresh token in DB (for validation later)
      await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

      // Send tokens as cookies
      setTokenCookies(res, accessToken, refreshToken);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
          },
        },
      });
    } catch (error) {
      console.error('Google authentication error:', error);
      res.status(401).json({ success: false, message: 'Invalid Google credential' });
    }
  })
);

/**
 * 📌 Refresh token
 * POST /api/auth/refresh
 * - Validates refresh token
 * - Issues new access + refresh tokens
 */
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Check if refresh token matches DB
      const user = await prisma.user.findFirst({
        where: { id: decoded.userId, refreshToken, isActive: true },
      });

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid refresh token' });
      }

      // Generate new tokens
      const tokens = generateTokens(user.id);
      await prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken } });
      setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

      res.status(200).json({ success: true, message: 'Token refreshed successfully' });
    } catch (err) {
      console.error('Token refresh error:', err);
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
  })
);

/**
 * 📌 Get current logged-in user
 * GET /api/auth/me
 * - Uses `authenticate` middleware to check access token
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: { user: req.user } });
  })
);

/**
 * 📌 Logout
 * POST /api/auth/logout
 * - Clears DB refresh token
 * - Clears cookies
 */
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req, res) => {
    await prisma.user.update({ where: { id: req.user.id }, data: { refreshToken: null } });
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  })
);

export { router as authRoutes };
