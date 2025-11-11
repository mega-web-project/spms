import axios from "axios";

// Create Axios instance
const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`, 
});

// Request interceptor — adds token to every request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("ACCESS_TOKEN");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handles token expiration and unauthorized requests
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("ACCESS_TOKEN");
      // Optionally, redirect to login page or refresh token
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
