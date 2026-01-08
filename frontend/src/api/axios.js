import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://ptas-api.vercel.app/api",
});

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 1000; // 1 second (for testing/demo)

api.getWithCache = async (url, config = {}) => {
  const key = `${url}:${JSON.stringify(config.params || {})}`;
  const now = Date.now();

  if (cache.has(key)) {
    const { timestamp, data } = cache.get(key);
    if (now - timestamp < CACHE_DURATION) {
      return Promise.resolve(data);
    }
  }

  const response = await api.get(url, config);
  cache.set(key, { timestamp: now, data: response });
  return response;
};

// Clear cache helper if needed (e.g. on mutations)
api.clearCache = (keyPattern) => {
  if (!keyPattern) {
    cache.clear();
  } else {
    for (const key of cache.keys()) {
      if (key.includes(keyPattern)) cache.delete(key);
    }
  }
};

// Attach token automatically
api.interceptors.request.use((config) => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  if (userData?.accessToken) {
    config.headers.Authorization = `Bearer ${userData.accessToken}`;
  }
  return config;
});

// Handle Token Refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (!userData?.refreshToken) throw new Error("No refresh token");

        const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refreshToken: userData.refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken } = res.data.data || res.data;
        const updatedUser = { ...userData, accessToken, refreshToken: newRefreshToken || userData.refreshToken };
        localStorage.setItem("userData", JSON.stringify(updatedUser));

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("userData");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
