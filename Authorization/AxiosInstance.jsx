import axios from 'axios';

// Create instance
const axiosInstance = axios.create({
  baseURL: 'https://api.example.com/', // change to your API URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // You can add token here
    // Example:
    // const token = await AsyncStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle errors like 401, 500
      if (error.response.status === 401) {
        console.log('Unauthorized');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
