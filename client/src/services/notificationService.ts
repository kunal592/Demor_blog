import apiClient from './apiClient';

export const getNotifications = () => apiClient.get('/notifications');

export const markAsRead = (id: string) => apiClient.patch(`/notifications/${id}/read`);

export const markAllAsRead = () => apiClient.patch('/notifications/read-all');
