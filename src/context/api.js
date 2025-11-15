//src/context/api.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api";
const api = axios.create({ baseURL, timeout: 15000 });

api.interceptors.request.use(cfg => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      cfg.headers = cfg.headers || {};
      cfg.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {}
  return cfg;
}, err => Promise.reject(err));

api.interceptors.response.use(res => res, err => {
  const status = err?.response?.status;
  if (status === 401 || status === 403) {
    try { localStorage.removeItem("token"); localStorage.removeItem("user"); } catch {}
    // SPA redirect
    window.location.href = "/login";
  }
  return Promise.reject(err);
});

export default api;
