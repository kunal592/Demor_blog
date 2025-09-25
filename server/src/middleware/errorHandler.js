import { Prisma } from '@prisma/client';

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err?.message,
    stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined,
    url: req.url,
    method: req.method,
  });

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(400).json({ success: false, message: 'A record with this information already exists' });
      case 'P2025':
        return res.status(404).json({ success: false, message: 'Record not found' });
      default:
        return res.status(400).json({ success: false, message: 'Database error' });
    }
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: err.message });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large' });
  }

  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
};

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
