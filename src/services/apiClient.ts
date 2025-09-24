import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor to log more detailed errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      console.error('API Error Response:', error.response);
      console.error('API Error Request:', error.request);
    } else {
      console.error('Unexpected API Error:', error);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
