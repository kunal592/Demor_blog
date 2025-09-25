import axios from 'axios';
import { handleApiError } from '../utils/errorHandler';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors & retries
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const originalRequest = config;

    // Retry on server errors (5xx), up to 3 times
    // @ts-ignore
    const retryCount = originalRequest._retryCount || 0;
    if (response && response.status >= 500 && retryCount < 3) {
      // @ts-ignore
      originalRequest._retryCount = retryCount + 1;
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise((res) => setTimeout(res, delay));
      return apiClient(originalRequest);
    }

    handleApiError(error, `request to ${originalRequest.url}`);
    return Promise.reject(error);
  }
);

export default apiClient;
