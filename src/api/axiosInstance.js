import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://server-plantora-1.onrender.com',
  timeout: 5000,
});

axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.config.method.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`[API ERROR]`, error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;