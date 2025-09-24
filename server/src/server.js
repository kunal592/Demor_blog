
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';

// Import custom middleware and routes
import './auth/passport.js'; // Passport configuration
import { errorHandler } from './middleware/errorHandler.js';
import { authRoutes } from './auth/auth.routes.js';
import { blogRoutes } from './blog/blog.routes.js';
import { adminRoutes } from './blog/admin.routes.js';
import { userRoutes } from './auth/user.routes.js';
import { contactRoutes } from './notification/contact.routes.js';
import { notificationRoutes } from './notification/notification.routes.js';
import { commentRoutes } from './comment/comment.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

// Security Middleware
app.use(helmet({ contentSecurityPolicy: false }));

// CORS Configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  skip: (req) =>
    req.path.startsWith('/api/auth/refresh') || req.path.startsWith('/api/auth/me'),
});

if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
}

// Core Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Session and Passport Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/blogs/:slug/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use(errorHandler);

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Blog API available at http://localhost:${PORT}/api`);
});
