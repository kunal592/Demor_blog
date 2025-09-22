/**
 * Database seeding script for initial data setup
 * Creates sample users, blogs, and interactions for development
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create sample users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@blogapp.com',
      name: 'Blog Admin',
      role: 'ADMIN',
      googleId: 'admin-google-id'
    }
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      name: 'John Doe',
      role: 'USER',
      googleId: 'user1-google-id'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      role: 'USER',
      googleId: 'user2-google-id'
    }
  });

  console.log('✅ Users created');

  // Create sample blogs
  const blogs = await Promise.all([
    prisma.blog.create({
      data: {
        title: 'Getting Started with React and TypeScript',
        slug: 'getting-started-react-typescript',
        content: `# Getting Started with React and TypeScript

React and TypeScript make a powerful combination for building robust web applications. In this guide, we'll explore how to set up a React project with TypeScript and best practices for using them together.

## Why TypeScript?

TypeScript provides static type checking, which helps catch errors at compile time rather than runtime. This is especially valuable in larger React applications where prop types and component interfaces become complex.

## Setting Up Your Project

\`\`\`bash
npx create-react-app my-app --template typescript
cd my-app
npm start
\`\`\`

## Component Best Practices

When creating React components with TypeScript, always define your prop interfaces:

\`\`\`typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {
  return (
    <button className={\`btn btn-\${variant}\`} onClick={onClick}>
      {label}
    </button>
  );
};
\`\`\`

This approach ensures type safety and better developer experience with IDE support.`,
        excerpt: 'Learn how to combine React and TypeScript for building robust web applications with static type checking.',
        summary: 'A comprehensive guide covering React and TypeScript integration, including setup instructions, component best practices, and the benefits of static type checking for larger applications.',
        isPublished: true,
        isFeatured: true,
        readTime: 5,
        tags: ['react', 'typescript', 'javascript', 'web-development'],
        viewCount: 150,
        authorId: user1.id
      }
    }),

    prisma.blog.create({
      data: {
        title: 'Building Scalable APIs with Node.js and Express',
        slug: 'building-scalable-apis-nodejs-express',
        content: `# Building Scalable APIs with Node.js and Express

Creating scalable APIs is crucial for modern web applications. This guide covers essential patterns and best practices for building robust Node.js APIs using Express.js.

## Project Structure

A well-organized project structure is the foundation of maintainable code:

\`\`\`
src/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
└── utils/
\`\`\`

## Error Handling Middleware

Proper error handling is essential for production APIs:

\`\`\`javascript
const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.errors
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};
\`\`\`

## Database Integration

Use connection pooling and proper query optimization for better performance.`,
        excerpt: 'Essential patterns and best practices for building robust, scalable Node.js APIs with Express.js framework.',
        summary: 'A detailed guide covering API architecture, error handling, database integration, and performance optimization techniques for Node.js and Express applications.',
        isPublished: true,
        isFeatured: true,
        readTime: 8,
        tags: ['nodejs', 'express', 'api', 'backend', 'javascript'],
        viewCount: 200,
        authorId: user2.id
      }
    }),

    prisma.blog.create({
      data: {
        title: 'CSS Grid vs Flexbox: When to Use Each',
        slug: 'css-grid-vs-flexbox-when-to-use',
        content: `# CSS Grid vs Flexbox: When to Use Each

Both CSS Grid and Flexbox are powerful layout systems, but they serve different purposes. Understanding when to use each will make you a more effective front-end developer.

## Flexbox: One-Dimensional Layout

Flexbox is designed for laying out items in a single dimension - either as a row or column.

### Perfect for:
- Navigation bars
- Button groups  
- Centering content
- Distributing space between items

\`\`\`css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
\`\`\`

## CSS Grid: Two-Dimensional Layout

CSS Grid excels at creating complex layouts with rows and columns.

### Perfect for:
- Page layouts
- Card grids
- Complex positioning
- Overlapping elements

\`\`\`css
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
\`\`\`

## When to Use Both

Often, the best layouts combine both Grid and Flexbox - use Grid for the overall page structure and Flexbox for component-level layouts.`,
        excerpt: 'Understanding the differences between CSS Grid and Flexbox and when to use each layout system effectively.',
        summary: 'A practical comparison of CSS Grid and Flexbox, covering their strengths, use cases, and how to combine them for optimal layout design.',
        isPublished: true,
        readTime: 6,
        tags: ['css', 'grid', 'flexbox', 'layout', 'frontend'],
        viewCount: 180,
        authorId: adminUser.id
      }
    })
  ]);

  console.log('✅ Blogs created');

  // Create sample interactions
  await Promise.all([
    // Likes
    prisma.like.create({
      data: { userId: user1.id, blogId: blogs[1].id }
    }),
    prisma.like.create({
      data: { userId: user2.id, blogId: blogs[0].id }
    }),
    prisma.like.create({
      data: { userId: adminUser.id, blogId: blogs[0].id }
    }),

    // Bookmarks
    prisma.bookmark.create({
      data: { userId: user1.id, blogId: blogs[2].id }
    }),
    prisma.bookmark.create({
      data: { userId: user2.id, blogId: blogs[2].id }
    })
  ]);

  console.log('✅ Interactions created');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });