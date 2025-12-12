// src/lib/auth.js
import apiClient from "./apiClient";

/**
 * login - call backend, store tokens and user info
 * Expected backend response: { accessToken, refreshToken, user }
 * Adjust field names if your backend uses different keys.
 */
export async function login(email, password) {
  const res = await apiClient.post("/auth/login", { email, password });
  // If your backend returns tokens/names under different keys, update these lines.
  const accessToken = res.data.accessToken || res.data.token || res.data.access_token;
  const refreshToken = res.data.refreshToken || res.data.refresh_token;
  const user = res.data.user || res.data.data || res.data.userInfo;

  if (!accessToken) {
    throw new Error("Login response did not include access token.");
  }

  const auth = { accessToken, refreshToken };
  localStorage.setItem("auth", JSON.stringify(auth));
  if (user) {
    localStorage.setItem("userData", JSON.stringify(user)); // used by Dashboard
  }
  return { auth, user, raw: res.data };
}

export function logout() {
  localStorage.removeItem("auth");
  localStorage.removeItem("userData");
  // optionally call backend to invalidate refresh token
}

export function getAuth() {
  try {
    return JSON.parse(localStorage.getItem("auth"));
  } catch {
    return null;
  }
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("userData"));
  } catch {
    return null;
  }
}
