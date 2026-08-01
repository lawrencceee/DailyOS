import axios from "axios";
import { TOKEN_STORAGE_KEY } from "../constants/auth.js";

const inferredBaseURL = `${window.location.protocol}//${window.location.hostname}:8000/api/v1`;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || inferredBaseURL,
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT to every request, if we have one. This is the one
// place auth needed to touch the request pipeline — every other
// *Service file built on top of `api` gets this for free.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 means the token is missing/invalid/expired — force back to
// the login page rather than let the app sit in a broken half-authed
// state showing stale data or repeatedly failing requests.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
