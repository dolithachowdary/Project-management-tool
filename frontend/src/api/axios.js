import axios from "axios";

const api = axios.create({
  baseURL: process.env.BASE_URL || "http://localhost:5000/api",
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
  const user = JSON.parse(localStorage.getItem("userData"));
  if (user?.accessToken) {
    config.headers.Authorization = `Bearer ${user.accessToken}`;
  }
  return config;
});

export default api;
