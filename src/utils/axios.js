import axios from 'axios';

const baseURL = 'http://localhost:8000';  // Remove /api since we include it in the URLs

const axiosInstance = axios.create({
  baseURL,
  timeout: 15000, // Increase timeout to 15 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Debug log
    console.log('Request Config:', {
      url: config.url,
      method: config.method,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Received response from:', response.config.url);
    console.log('Response data:', response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If server is not responding, retry up to 3 times
    if (!error.response && !originalRequest._retry) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      if (originalRequest._retryCount <= 3) {
        console.log(`Retrying request (${originalRequest._retryCount}/3)...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        return axiosInstance(originalRequest);
      }
    }

    console.error('Response error:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance; 