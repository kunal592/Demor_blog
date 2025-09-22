/**
 * Database configuration and connection management
 * Uses Prisma Client for PostgreSQL (Neon) database operations
 */

import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Database connection test
export const testConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Graceful disconnect
export const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log('📊 Database disconnected');
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
};