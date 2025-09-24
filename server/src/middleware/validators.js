import { body, query, param, validationResult } from 'express-validator';

// Error handling middleware for validators
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// --- Blog validation rules ---

export const blogQueryValidators = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().trim(),
  query('tag').optional().isString().trim(),
  query('author').optional().isString().trim(),
  query('featured').optional().isBoolean(),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'viewCount', 'likes', 'comments']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Invalid sort order'),
];

export const blogIdValidator = [
  param('id').isUUID(4).withMessage('Invalid blog ID'),
];

export const blogSlugValidator = [
  param('slug').isString().withMessage('Invalid blog slug'),
];

export const createBlogValidators = [
  body('title').notEmpty().withMessage('Title is required').isString().trim(),
  body('content').notEmpty().withMessage('Content is required').isString(),
  body('excerpt').optional().isString().trim(),
  body('coverImage').optional().isURL().withMessage('Invalid image URL'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().isString().trim(),
  body('isPublished').optional().isBoolean(),
  body('isFeatured').optional().isBoolean(),
];

export const updateBlogValidators = [
  ...blogIdValidator,
  body('title').optional().isString().trim(),
  body('content').optional().isString(),
  body('excerpt').optional().isString().trim(),
  body('coverImage').optional().isURL().withMessage('Invalid image URL'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().isString().trim(),
  body('isPublished').optional().isBoolean(),
  body('isFeatured').optional().isBoolean(),
];

export const userBlogQueryValidators = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['published', 'draft']).withMessage('Invalid status'),
];