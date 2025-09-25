import apiClient from './apiClient';
import { User, ApiResponse } from '../types';

class UserService {
  async getUserById(userId: string) {
    const res = await apiClient.get<ApiResponse<{ user: User }>>(`/users/${userId}`);
    if (res.data.success && res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to fetch user');
  }

  async toggleFollow(userId: string) {
    const res = await apiClient.post<ApiResponse<{ isFollowing: boolean; followers: any[] }>>(`/users/${userId}/follow`);
    if (res.data.success && res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to toggle follow');
  }
}

export const userService = new UserService();
