import axios from "axios";

/**
 * Single axios instance shared by every *Service module. Base URL and
 * interceptors (e.g. auth headers, once v2 adds them) are configured
 * once here rather than repeated per-service.
 *
 * If VITE_API_BASE_URL isn't explicitly set, the backend's address is
 * inferred from whatever host the page itself was loaded from. This is
 * what makes the same build work whether opened as
 * http://localhost:5173 (desktop, same machine as Docker) or
 * http://192.168.x.x:5173 (a phone on the same Wi-Fi) — hardcoding
 * "localhost" only ever works on the machine actually running Docker,
 * since "localhost" always means the current device, never the server.
 */
const inferredBaseURL = `${window.location.protocol}//${window.location.hostname}:8000/api/v1`;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || inferredBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
