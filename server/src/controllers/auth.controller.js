import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- Helpers ---

// Generate JWT tokens
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

// Set secure HTTP-only cookies
const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax', // Use 'lax' for development
    path: '/',
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000 // Corrected to 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

// --- Controllers ---

/**
 * Google OAuth login
 */
export const googleLogin = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ success: false, message: 'Google credential is required' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const role = email === process.env.ADMIN_EMAIL ? 'ADMIN' : 'USER';
      user = await prisma.user.create({
        data: { email, name, avatar: picture, googleId, role }
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, avatar: picture, name }
      });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    setTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, role: user.role }
      }
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(401).json({ success: false, message: 'Invalid Google credential' });
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        isActive: true,
        NOT: {
          refreshToken: null,
        },
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token or user is inactive' });
    }
    
    const tokens = generateTokens(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    res.status(200).json({ success: true, message: 'Token refreshed successfully', data: {} });
  } catch (error) {
     if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
    console.error('Refresh token error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during token refresh' });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
};

/**
 * Logout user
 */
export const logoutUser = async (req, res) => {
  await prisma.user.update({
    where: { id: req.user.id },
    data: { refreshToken: null }
  });

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(200).json({ success: true, message: 'Logged out successfully', data: {} });
};