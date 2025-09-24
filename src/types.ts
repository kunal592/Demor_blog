
export interface User {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    bio: string | null;
    role: 'USER' | 'ADMIN';
    isActive: boolean;
    createdAt: string;
    followers: { followerId: string, followingId: string }[];
    following: { followerId: string, followingId: string }[];
}

export interface Blog {
    id: string;
    slug: string;
    title: string;
    content: string;
    excerpt: string;
    summary?: string;
    coverImage: string;
    tags: string[];
    isPublished: boolean;
    isFeatured: boolean;
    author: User;
    viewCount: number;
    readTime: number;
    createdAt: string;
    updatedAt: string;
    _count: {
        likes: number;
    };
}

export interface UserInteractions {
    liked: boolean;
    bookmarked: boolean;
}

export interface Comment {
    id: string;
    content: string;
    user: User;
    createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface AdminStats {
    overview: {
        totalUsers: number;
        userGrowth: number;
        totalBlogs: number;
        publishedBlogs: number;
        totalLikes: number;
    };
    recentActivity: {
        recentUsers: User[];
        recentBlogs: Blog[];
    };
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
}

export interface BlogFormData {
    title: string;
    content: string;
    excerpt: string;
    coverImage: string;
    tags: string[];
    isPublished: boolean;
    isFeatured: boolean;
}
