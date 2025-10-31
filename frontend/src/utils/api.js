// src/utils/api.js
const API_BASE_URL = "http://192.168.0.111:5000/api";

export async function apiRequest(endpoint, options = {}, retry = true) {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && retry && refreshToken) {
      // Access token might be expired — attempt refresh
      const refreshed = await refreshAccessToken(refreshToken);
      if (refreshed) {
        return apiRequest(endpoint, options, false); // Retry once
      } else {
        handleLogout();
        throw new Error("Session expired. Please log in again.");
      }
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Request failed");
    }

    return response.json();
  } catch (err) {
    console.error("API Request Error:", err.message);
    throw err;
  }
}

async function refreshAccessToken(refreshToken) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    localStorage.setItem("accessToken", data.accessToken);
    return true;
  } catch (err) {
    console.error("Refresh token failed:", err);
    return false;
  }
}

function handleLogout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.location.href = "/";
}
