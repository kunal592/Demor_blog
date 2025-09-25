import axios from 'axios';
import { handleApiError } from '../utils/errorHandler';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor to handle errors and retries
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const originalRequest = config;

    // @ts-ignore
    const retryCount = originalRequest._retryCount || 0;

    // Retry on 5xx server errors, up to 3 times
    if (response && response.status >= 500 && retryCount < 3) {
      // @ts-ignore
      originalRequest._retryCount = retryCount + 1;

      const delay = response.headers['retry-after']
        ? parseInt(response.headers['retry-after'], 10) * 1000
        : Math.pow(2, retryCount) * 1000;

      console.log(`[API Retry] Retrying request to ${originalRequest.url} in ${delay}ms... (Attempt ${retryCount + 1})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return apiClient(originalRequest);
    }

    // If it's not a retryable error, use the centralized handler to log it.
    // The handler itself logs the detailed developer message to the console.
    handleApiError(error, `request to ${originalRequest.url}`);

    // We reject with the original error to let the calling code handle the UI update
    return Promise.reject(error);
  }
);

export default apiClient;
