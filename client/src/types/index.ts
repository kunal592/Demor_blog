
export interface User {
  id: string;
  name: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  likes: string[];
  replies: Comment[];
  createdAt: string;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
}
