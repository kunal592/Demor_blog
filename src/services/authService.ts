/**
 * Authentication service for Google OAuth + JWT
 * - Calls backend `/auth` routes
 * - Provides methods for login, refresh, get user, logout
 * - Wraps API client with typed responses
 */

import  apiClient  from './apiClient';
import { User, ApiResponse } from '../types';

class AuthService {
  /**
   * 🔑 Login with Google OAuth credential
   * - Sends Google token (`credential`) to backend
   * - Backend verifies with Google + issues cookies
   */
  async googleLogin(credential: string): Promise<User> {
    const res = await apiClient.post<ApiResponse<{ user: User }>>(
      '/auth/google',
      { credential }
    );

    if (res.data.success && res.data.data?.user) {
      return res.data.data.user;
    }
    throw new Error(res.data.message || 'Login failed');
  }

  /**
   * 👤 Get current logged-in user
   * - Calls `/auth/me`
   * - Relies on `accessToken` cookie being valid
   * - If expired, axios interceptor triggers `/auth/refresh`
   */
  async getCurrentUser(): Promise<User> {
    const res = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    if (res.data.success && res.data.data?.user) {
      return res.data.data.user;
    }
    throw new Error(res.data.message || 'No user found');
  }

  /**
   * 🔄 Refresh JWT tokens
   * - Calls `/auth/refresh`
   * - This is usually handled by axios interceptor
   */
  async refreshToken(): Promise<void> {
    const res = await apiClient.post<ApiResponse<null>>('/auth/refresh');
    if (!res.data.success) {
      throw new Error(res.data.message || 'Token refresh failed');
    }
  }

  /**
   * 🚪 Logout user
   * - Calls `/auth/logout`
   * - Clears DB refresh token + cookies
   */
  async logout(): Promise<void> {
    try {
      const res = await apiClient.post<ApiResponse<null>>('/auth/logout');
      if (!res.data.success) {
        console.warn('Logout request failed:', res.data.message);
      }
    } catch (err) {
      console.error('Logout request failed:', err);
    }
  }

  /**
   * ✅ Check if user is authenticated
   * - Simply tries to fetch `/auth/me`
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
