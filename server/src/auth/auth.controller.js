import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { OAuth2Client } from 'google-auth-library';
import { asyncHandler } from '../middleware/errorHandler.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId, type: 'access' }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId, type: 'refresh' }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = { httpOnly: true, secure: isProd, sameSite: isProd ? 'strict' : 'lax', path: '/' };
  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
};

export const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ success: false, message: 'Credential required' });

  const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();
  const { sub: googleId, email, name, picture } = payload;

  let user = await prisma.user.findFirst({ where: { OR: [{ googleId }, { email }] } });

  if (user) {
    user = await prisma.user.update({ where: { id: user.id }, data: { googleId, name, avatar: picture } });
  } else {
    user = await prisma.user.create({ data: { email, name, avatar: picture, googleId } });
  }

  const { accessToken, refreshToken } = generateTokens(user.id);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
  setTokenCookies(res, accessToken, refreshToken);

  res.status(200).json({ success: true, data: { user } });
});

export const googleLoginCallback = asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Auth failed' });
  const { accessToken, refreshToken } = generateTokens(req.user.id);
  await prisma.user.update({ where: { id: req.user.id }, data: { refreshToken } });
  setTokenCookies(res, accessToken, refreshToken);
  res.redirect(process.env.CLIENT_URL || '/');
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ success: false, message: 'Refresh token required' });

  let decoded;
  try { decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET); } catch (err) { return res.status(401).json({ success: false, message: 'Invalid refresh token' }); }

  const user = await prisma.user.findFirst({ where: { id: decoded.userId, isActive: true, NOT: { refreshToken: null } } });
  if (!user) return res.status(401).json({ success: false, message: 'Invalid refresh token or user inactive' });

  const tokens = generateTokens(user.id);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken } });
  setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
  res.status(200).json({ success: true, message: 'Token refreshed' });
});

export const getProfile = asyncHandler((req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
});

export const logoutUser = asyncHandler(async (req, res) => {
  await prisma.user.update({ where: { id: req.user.id }, data: { refreshToken: null } });
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });
  res.status(200).json({ success: true, message: 'Logged out' });
});

export const loginFailure = asyncHandler((req, res) => {
  res.status(401).json({ success: false, message: 'Login failed' });
});
