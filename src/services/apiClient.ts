/**
 * Axios API client with interceptors
 * - Adds base config for all requests
 * - Handles token refresh logic automatically
 * - Queues failed requests during refresh to avoid multiple refresh calls
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';

// ✅ Backend base URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false; // Flag to prevent multiple refresh requests
  private failedQueue: Array<{ 
    resolve: (v?: unknown) => void; 
    reject: (r?: any) => void; 
    request: any 
  }> = [];

  constructor() {
    // ✅ Create axios instance
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      withCredentials: true, // Important for sending cookies
      headers: { 'Content-Type': 'application/json' },
    });

    this.setupInterceptors();
  }

  /**
   * ✅ Setup Axios interceptors
   * - Response interceptor handles expired tokens (401)
   */
  private setupInterceptors() {
    this.client.interceptors.response.use(
      // If response is OK → just return it
      (response) => response,

      // If response is error → handle it
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // --- Handle 401 Unauthorized ---
        if (
          error.response?.status === 401 &&
          !originalRequest._retry && // Prevent infinite retry loop
          !originalRequest.url.includes('/auth/refresh') // Don’t retry refresh itself
        ) {
          originalRequest._retry = true;

          // If another refresh is in progress → queue the request
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject, request: originalRequest });
            });
          }

          // Start refresh
          this.isRefreshing = true;
          try {
            await this.client.post('/auth/refresh'); // 🔄 Try refreshing tokens
            this.isRefreshing = false;

            // Retry all queued requests
            this.failedQueue.forEach(({ resolve, request }) =>
              resolve(this.client(request))
            );
            this.failedQueue = [];

            // Retry the original request
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed → reject all queued requests
            this.isRefreshing = false;
            this.failedQueue.forEach(({ reject }) => reject(refreshError));
            this.failedQueue = [];

            // Force logout
            toast.error('Session expired, please log in again.');
            window.location.replace('/login');
            return Promise.reject(refreshError);
          }
        }

        // --- Handle other errors ---
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * ✅ Global error handler
   * - Shows toast for errors (except 401, handled separately)
   */
  private handleError(error: AxiosError) {
    const msg = (error.response?.data as any)?.message || error.message;
    if (error.response?.status !== 401) toast.error(msg);
  }

  // --- Convenience methods ---
  async get<T>(url: string, params?: any) { 
    return this.client.get<T>(url, { params }); 
  }
  async post<T>(url: string, data?: any, config?: any) { 
    return this.client.post<T>(url, data, config); 
  }
  async put<T>(url: string, data?: any) { 
    return this.client.put<T>(url, data); 
  }
  async delete<T>(url: string) { 
    return this.client.delete<T>(url); 
  }
  async patch<T>(url: string, data?: any) { 
    return this.client.patch<T>(url, data); 
  }
}

export const apiClient = new ApiClient();
