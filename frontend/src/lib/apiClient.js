// src/lib/apiClient.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb){
  refreshSubscribers.push(cb);
}
function onRefreshed(token){
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// attach access token before requests
apiClient.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("auth"); // or use context
    const auth = raw ? JSON.parse(raw) : null;
    if (auth?.accessToken) {
      config.headers.Authorization = `Bearer ${auth.accessToken}`;
    }
  } catch (e) {}
  return config;
});

// response interceptor to handle 401 -> refresh
apiClient.interceptors.response.use(
  response => response,
  error => {
    const { config, response } = error;
    if (!response) return Promise.reject(error); // network error
    if (response.status !== 401) return Promise.reject(error);

    // avoid infinite loop flag
    if (config._retry) return Promise.reject(error);
    config._retry = true;

    if (isRefreshing) {
      // queue requests while refresh in progress
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          config.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(config));
        });
      });
    }

    isRefreshing = true;
    const raw = localStorage.getItem("auth");
    const auth = raw ? JSON.parse(raw) : null;
    const refreshToken = auth?.refreshToken;

    if (!refreshToken) {
      // no refresh token: clear auth and redirect to login
      localStorage.removeItem("auth");
      isRefreshing = false;
      return Promise.reject(error);
    }

    return new Promise((resolve, reject) => {
      axios.post(`${API_BASE.replace(/\/api$/, "")}/api/auth/refresh`, {
        refreshToken
      })
      .then(res => {
        // expecting new access token (and maybe new refresh token)
        const newAccess = res.data.accessToken || res.data.token || null;
        const newRefresh = res.data.refreshToken || auth.refreshToken;

        const newAuth = {
          ...auth,
          accessToken: newAccess,
          refreshToken: newRefresh
        };
        localStorage.setItem("auth", JSON.stringify(newAuth));
        apiClient.defaults.headers.Authorization = `Bearer ${newAccess}`;
        onRefreshed(newAccess);
        resolve(apiClient(config));
      })
      .catch(err => {
        // refresh failed -> logout
        localStorage.removeItem("auth");
        reject(err);
      })
      .finally(() => {
        isRefreshing = false;
      });
    });
  }
);

export default apiClient;
