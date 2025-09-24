export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: 'USER' | 'ADMIN';
    isActive: boolean;
    createdAt: string;
}

export interface Blog {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    summary?: string;
    coverImage: string;
    isPublished: boolean;
    isFeatured: boolean;
    viewCount: number;
    readTime: number;
    tags: string[];
    createdAt: string;
    author: User;
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
    createdAt: string;
    user: User;
    blog: Blog;
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
