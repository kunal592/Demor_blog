/**
 * TypeScript type definitions for the blog application
 * Comprehensive type safety for all data structures
 */

// =====================
// Core Entities
// =====================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  summary?: string;
  coverImage?: string;
  isPublished: boolean;
  isFeatured: boolean;
  readTime?: number;
  tags: string[];
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  _count: {
    likes: number;
    bookmarks: number;
    comments: number;
  };
}

export interface BlogFormData {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags: string[];
  isPublished: boolean;
  isFeatured?: boolean;
}

export interface Like {
  id: string;
  userId: string;
  blogId: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  blogId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  blog: {
    id: string;
    title: string;
    slug: string;
  };
  parent?: Comment;
  replies: Comment[];
}

// =====================
// Stats & Dashboard
// =====================

export interface UserStats {
  totalBookmarks: any;
  totalBlogs: any;
  blogsPublished: number;
  totalViews: number;
  likesReceived: number;
  bookmarksReceived: number;
  blogsLiked: number;
  blogsBookmarked: number;
}

export interface AdminStats {
  overview: {
    totalUsers: number;
    totalBlogs: number;
    publishedBlogs: number;
    draftBlogs: number;
    totalLikes: number;
    totalBookmarks: number;
    totalComments: number;
    userGrowth: number;
  };
  recentActivity: {
    recentUsers: User[];
    recentBlogs: Blog[];
    topBlogs: Blog[];
  };
}

export interface DashboardData {
  stats: UserStats;
  recentBlogs: Blog[];
  recentLikes: Blog[];
  recentBookmarks: Blog[];
}

// =====================
// Helpers
// =====================

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

export interface BlogFilters {
  page?: number;
  limit?: number;
  search?: string;
  tag?: string;
  author?: string;
  featured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'USER' | 'ADMIN';
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserInteractions {
  liked: boolean;
  bookmarked: boolean;
}

// =====================
// API Response Types
// =====================

// Auth
export type AuthResponse = ApiResponse<{ user: User }>;
export type CurrentUserResponse = ApiResponse<{ user: User }>;
export type RefreshResponse = ApiResponse<{}>;
export type LogoutResponse = ApiResponse<{}>;

// Blogs
export type BlogListResponse = ApiResponse<{
  blogs: Blog[];
  pagination: PaginationData;
}>;
export type SingleBlogResponse = ApiResponse<{
  blog: Blog;
  userInteractions?: UserInteractions;
}>;
export type BlogCreateResponse = ApiResponse<{ blog: Blog }>;
export type BlogUpdateResponse = ApiResponse<{ blog: Blog }>;

// Users
export type UserListResponse = ApiResponse<{
  users: User[];
  pagination: PaginationData;
}>;
export type UserStatsResponse = ApiResponse<UserStats>;
export type DashboardResponse = ApiResponse<DashboardData>;

// Admin
export type AdminStatsResponse = ApiResponse<AdminStats>;
