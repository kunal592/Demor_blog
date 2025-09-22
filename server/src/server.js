/**
 * Main Express server entry point
 * - Sets up security, CORS, cookies, logging, rate limiting
 * - Registers all API routes
 * - Handles errors and graceful shutdown
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Custom middleware
import { errorHandler } from './middleware/errorHandler.js';
import { authRoutes } from './routes/authRoutes.js';
import { blogRoutes } from './routes/blogRoutes.js';
import { adminRoutes } from './routes/adminRoutes.js';
import { userRoutes } from './routes/userRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

/* ----------------------------
   🔒 Security (Helmet)
   - Protects against common attacks
   - Disables CSP in dev to allow Google OAuth scripts
----------------------------- */
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

/* ----------------------------
   🌍 CORS (Cross-Origin Resource Sharing)
   - Allows requests from frontend (Vite on port 5173)
   - Supports credentials (cookies)
----------------------------- */
app.use(
  cors({
    origin: process.env.CLIENT_URL, // Using a single string from .env for a more explicit and reliable configuration.
    credentials: true,
  })
);

/* ----------------------------
   ⚡ Rate Limiting
   - Prevents abuse (DDOS, spam requests)
   - Increased limit for dev (2000 per 15 min)
   - Skips refresh & auth check to prevent infinite loops
----------------------------- */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 2000, // per IP
  skip: (req) =>
    req.path.startsWith('/api/auth/refresh') || // skip refresh route
    req.path.startsWith('/api/auth/me'), // skip auth check
});

// Apply limiter only in production
if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
}

/* ----------------------------
   🛠 Core Middleware
----------------------------- */
app.use(express.json({ limit: '10mb' })); // parse JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // parse form data
app.use(cookieParser()); // parse cookies
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined')); // logging

/* ----------------------------
   🚦 API Routes
----------------------------- */
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

/* ----------------------------
   ❤️ Health Check
   - Simple status endpoint for monitoring
----------------------------- */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/* ----------------------------
   🛑 404 Handler
----------------------------- */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

/* ----------------------------
   ⚠️ Global Error Handler
----------------------------- */
app.use(errorHandler);

/* ----------------------------
   🔌 Graceful Shutdown
----------------------------- */
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

/* ----------------------------
   🚀 Start Server
----------------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Blog API available at http://localhost:${PORT}/api`);
});
