/**
 * Authentication service for Google OAuth + JWT
 * - Integrates with backend `/auth` routes
 * - Uses localStorage to persist token
 * - Returns user objects consistent with `types.ts`
 */

import apiClient from './apiClient';
import { User, ApiResponse } from '../types';

class AuthService {
  private TOKEN_KEY = 'token';

  /**
   * 🔑 Login with Google OAuth credential
   * - Sends Google token (`credential`) to backend
   * - Backend verifies with Google + issues JWT
   */
  async googleLogin(credential: string): Promise<{ user: User; token: string }> {
    const res = await apiClient.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/google',
      { credential }
    );

    if (res.data.success && res.data.data?.user && res.data.data?.token) {
      // Save token to localStorage
      localStorage.setItem(this.TOKEN_KEY, res.data.data.token);

      // Attach token to axios for future requests
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${res.data.data.token}`;

      return { user: res.data.data.user, token: res.data.data.token };
    }

    throw new Error(res.data.message || 'Login failed');
  }

  /**
   * 👤 Get current logged-in user
   * - Calls `/auth/me`
   * - Relies on localStorage JWT
   */
  async getCurrentUser(): Promise<User> {
    const res = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    if (res.data.success && res.data.data?.user) {
      return res.data.data.user;
    }
    throw new Error(res.data.message || 'No user found');
  }

  /**
   * 🚪 Logout user
   * - Calls `/auth/logout`
   * - Clears token from localStorage
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post<ApiResponse<null>>('/auth/logout');
    } catch (err) {
      console.warn('Logout request failed (client will still clear session):', err);
    } finally {
      // Clear localStorage + axios header
      localStorage.removeItem(this.TOKEN_KEY);
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }

  /**
   * ✅ Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return false;

    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 📦 Restore token from localStorage into axios
   * - Used when app initializes
   */
  restoreToken(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }
}

export const authService = new AuthService();
