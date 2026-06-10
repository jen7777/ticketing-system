import axios from "axios";

const isLocalhost = ["localhost", "127.0.0.1"].includes(
  window.location.hostname,
);

const defaultBaseURL = isLocalhost
  ? `${window.location.protocol}//${window.location.hostname}:5001/api`
  : `${window.location.origin}/api`;

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultBaseURL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    return Promise.reject(error);
  },
);

export default API;
