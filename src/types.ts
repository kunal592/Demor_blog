// ----------------------
// USER MODEL
// ----------------------
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;

  // ✅ Updated relations
  followers?: {
    followerId: string;
    followingId: string;
    follower?: Pick<User, 'id' | 'name' | 'avatar'>; // include follower data
  }[];
  following?: {
    followerId: string;
    followingId: string;
    following?: Pick<User, 'id' | 'name' | 'avatar'>; // include following data
  }[];
}

// ----------------------
// BLOG MODEL
// ----------------------
export interface Blog {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null; // ✅ can be nullable in DB
  summary?: string | null;
  coverImage: string | null;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  author: User;
  authorId?: string;
  viewCount: number;
  readTime: number;
  createdAt: string;
  updatedAt: string;

  // ✅ relations
  _count: {
    likes: number;
    bookmarks?: number;
    comments?: number;
  };
}

// ----------------------
// USER INTERACTIONS
// ----------------------
export interface UserInteractions {
  liked: boolean;
  bookmarked: boolean;
}

// ----------------------
// COMMENT MODEL
// ----------------------
export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  blogId?: string;

  user: Pick<User, 'id' | 'name' | 'avatar'>;

  // ✅ threaded replies
  parentId?: string | null;
  replies?: Comment[];
}

// ----------------------
// AUTH STATE
// ----------------------
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// ----------------------
// ADMIN DASHBOARD
// ----------------------
export interface AdminStats {
  overview: {
    totalUsers: number;
    userGrowth: number;
    totalBlogs: number;
    publishedBlogs: number;
    totalLikes: number;
    totalBookmarks?: number;
    totalComments?: number;
  };
  recentActivity: {
    recentUsers: User[];
    recentBlogs: Blog[];
  };
}

// ----------------------
// API WRAPPERS
// ----------------------
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

// ----------------------
// BLOG FORMS
// ----------------------
export interface BlogFormData {
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
}

// ----------------------
// BLOG FILTERS
// ----------------------
export interface BlogFilters {
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc'; // ✅ renamed from "order" → matches backend
  isFeatured?: boolean;
  author?: string;
  status?: 'published' | 'draft';
  search?: string;
  tag?: string;
}

// ----------------------
// PAGINATION
// ----------------------
export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number; // ✅ renamed to "pages" → backend returns "pages"
}
