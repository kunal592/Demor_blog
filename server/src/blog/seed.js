/**
 * 🌱 Prisma Seed Script
 * Populates the database with sample users, blogs, comments, likes, bookmarks, follows, and notifications
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // --- USERS ---
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@blogapp.com',
      name: 'Blog Admin',
      role: 'ADMIN',
      password: await bcrypt.hash('admin123', 10),
      googleId: 'admin-google-id'
    }
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      name: 'John Doe',
      password: await bcrypt.hash('password123', 10),
      googleId: 'user1-google-id'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      password: await bcrypt.hash('password123', 10),
      googleId: 'user2-google-id'
    }
  });

  console.log('✅ Users created');

  // --- BLOGS ---
  const blogs = await Promise.all([
    prisma.blog.create({
      data: {
        title: 'React + TypeScript Best Practices',
        slug: 'react-typescript-best-practices',
        content: 'This is a detailed blog on using React with TypeScript...',
        excerpt: 'A guide on best practices for React + TS projects.',
        summary: 'Covers setup, typing props, hooks, and advanced tips.',
        isPublished: true,
        tags: ['react', 'typescript', 'frontend'],
        readTime: 5,
        viewCount: 150,
        authorId: user1.id
      }
    }),
    prisma.blog.create({
      data: {
        title: 'Node.js API with Express',
        slug: 'nodejs-api-express',
        content: 'How to build a scalable API with Node.js and Express...',
        excerpt: 'Learn how to design scalable Node.js APIs.',
        summary: 'Best practices in Express project structure, middlewares, and error handling.',
        isPublished: true,
        tags: ['nodejs', 'express', 'backend'],
        readTime: 7,
        viewCount: 200,
        authorId: user2.id
      }
    }),
    prisma.blog.create({
      data: {
        title: 'CSS Grid vs Flexbox',
        slug: 'css-grid-vs-flexbox',
        content: 'When to use CSS Grid and when to use Flexbox...',
        excerpt: 'Understanding layout systems in CSS.',
        summary: 'Learn when to use CSS Grid or Flexbox with examples.',
        isPublished: true,
        tags: ['css', 'grid', 'flexbox'],
        readTime: 4,
        viewCount: 180,
        authorId: adminUser.id
      }
    })
  ]);

  console.log('✅ Blogs created');

  // --- COMMENTS (threaded) ---
  const comment1 = await prisma.comment.create({
    data: {
      content: 'Great article! Learned a lot 👏',
      blogId: blogs[0].id,
      userId: user2.id
    }
  });

  await prisma.comment.create({
    data: {
      content: 'Thanks! Glad it helped 🙌',
      blogId: blogs[0].id,
      userId: user1.id,
      parentId: comment1.id
    }
  });

  console.log('✅ Comments created');

  // --- LIKES ---
  await Promise.all([
    prisma.like.create({ data: { userId: user1.id, blogId: blogs[1].id } }),
    prisma.like.create({ data: { userId: user2.id, blogId: blogs[0].id } }),
    prisma.like.create({ data: { userId: adminUser.id, blogId: blogs[0].id } })
  ]);

  console.log('✅ Likes created');

  // --- BOOKMARKS ---
  await Promise.all([
    prisma.bookmark.create({ data: { userId: user1.id, blogId: blogs[2].id } }),
    prisma.bookmark.create({ data: { userId: user2.id, blogId: blogs[2].id } })
  ]);

  console.log('✅ Bookmarks created');

  // --- FOLLOWS ---
  await Promise.all([
    prisma.follows.create({ data: { followerId: user1.id, followingId: user2.id } }),
    prisma.follows.create({ data: { followerId: user2.id, followingId: adminUser.id } }),
    prisma.follows.create({ data: { followerId: adminUser.id, followingId: user1.id } })
  ]);

  console.log('✅ Follows created');

  // --- NOTIFICATIONS ---
  await Promise.all([
    prisma.notification.create({
      data: {
        type: 'LIKE',
        message: `${user1.name} liked your blog.`,
        senderId: user1.id,
        recipientId: user2.id
      }
    }),
    prisma.notification.create({
      data: {
        type: 'COMMENT',
        message: `${user2.name} commented on your blog.`,
        senderId: user2.id,
        recipientId: user1.id
      }
    }),
    prisma.notification.create({
      data: {
        type: 'FOLLOW',
        message: `${adminUser.name} started following you.`,
        senderId: adminUser.id,
        recipientId: user1.id
      }
    })
  ]);

  console.log('✅ Notifications created');
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
