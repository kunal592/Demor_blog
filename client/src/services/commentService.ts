import apiClient from './apiClient';

export const getComments = (slug: string) => apiClient.get(`/blogs/${slug}/comments`);

export const createComment = (slug: string, content: string, parentId?: string) => apiClient.post(`/blogs/${slug}/comments`, { content, parentId });

export const likeComment = (slug: string, commentId: string) => apiClient.post(`/blogs/${slug}/comments/${commentId}/like`);
