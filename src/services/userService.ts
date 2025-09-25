import apiClient from './apiClient';
import { User, ApiResponse, Blog } from '../types';

class UserService {
  /**
   * Get public profile of a user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const res = await apiClient.get<ApiResponse<{ user: User }>>(`/users/${userId}`);
    if (res.data.success && res.data.data?.user) {
      return res.data.data.user; // ✅ return the actual User, not wrapped
    }
    throw new Error(res.data.message || 'Failed to fetch user');
  }

  /**
   * Update current user's profile (name, avatar, bio)
   */
  async updateProfile(payload: { name?: string; avatar?: string; bio?: string }) {
    const res = await apiClient.put<ApiResponse<{ user: User }>>(`/users/profile`, payload);
    if (res.data.success && res.data.data) return res.data.data.user;
    throw new Error(res.data.message || 'Failed to update profile');
  }

  /**
   * Follow a user
   */
  async followUser(userId: string) {
    const res = await apiClient.post<ApiResponse<{ isFollowing: boolean; followers: any[] }>>(
      `/users/${userId}/follow`
    );
    if (res.data.success && res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to follow user');
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(userId: string) {
    const res = await apiClient.delete<ApiResponse<{ isFollowing: boolean; followers: any[] }>>(
      `/users/${userId}/unfollow`
    );
    if (res.data.success && res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Failed to unfollow user');
  }

  /**
   * Get blogs liked by the current user
   */
  async getUserLikes(page = 1, limit = 10) {
    const res = await apiClient.get<ApiResponse<{ blogs: Blog[] }>>(`/users/likes`, {
      params: { page, limit },
    });
    if (res.data.success && res.data.data) return res.data.data.blogs;
    throw new Error(res.data.message || 'Failed to fetch liked blogs');
  }

  /**
   * Get blogs bookmarked by the current user
   */
  async getUserBookmarks(page = 1, limit = 10) {
    const res = await apiClient.get<ApiResponse<{ blogs: Blog[] }>>(`/users/bookmarks`, {
      params: { page, limit },
    });
    if (res.data.success && res.data.data) return res.data.data.blogs;
    throw new Error(res.data.message || 'Failed to fetch bookmarked blogs');
  }
}

export const userService = new UserService();
