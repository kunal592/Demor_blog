
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  role: 'USER' | 'ADMIN';
  followers: { followerId: string, followingId: string }[];
  following: { followerId: string, followingId: string }[];
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  author: User;
  viewCount: number;
  readTime: number;
  createdAt: string;
  updatedAt: string;
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
