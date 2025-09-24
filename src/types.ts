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
    content: string;
    coverImage: string;
    isPublished: boolean;
    isFeatured: boolean;
    viewCount: number;
    createdAt: string;
    author: User;
    _count: {
        likes: number;
    };
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
