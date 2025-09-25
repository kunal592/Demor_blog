import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import path from 'path';

// configure env
dotenv.config();

import './auth/passport.js'; // passport strategies

// routers & middleware
import { errorHandler } from './middleware/errorHandler.js';
import { authRoutes } from './auth/auth.routes.js';
import { userRoutes } from './auth/user.routes.js';
import { blogRoutes } from './blog/blog.routes.js';
import { commentRoutes } from './comment/comment.routes.js';
import { contactRoutes } from './notification/contact.routes.js';
import { notificationRoutes } from './notification/notification.routes.js';

const app = express();
const PORT = process.env.PORT || 5003;

// security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// rate limiting (only in production typically)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
});
if (process.env.NODE_ENV === 'production') app.use(limiter);

// core middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// session/passport (passport is used for redirect flows; tokens are handled by JWT cookies)
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

// api mount points
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/blogs/:slug/comments', commentRoutes); // commentRoutes expects /:slug/comments
app.use('/api/contact', contactRoutes);
app.use('/api/notifications', notificationRoutes);

// health
app.get('/api/health', (req, res) =>
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() })
);

// global error handler + 404
app.use(errorHandler);
app.use('*', (req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

// start
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 API available at http://localhost:${PORT}/api`);
});
