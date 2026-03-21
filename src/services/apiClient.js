import { API_CONFIG, getApiUrl } from "../config/api";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// Global logout callback - set by AuthContext
let onTokenExpiredCallback = null;

export function setOnTokenExpired(callback) {
  onTokenExpiredCallback = callback;
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens({ accessToken, refreshToken } = {}) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function handleTokenExpiration() {
  console.log('🔐 Token expired - logging out');
  clearTokens();
  if (onTokenExpiredCallback) {
    onTokenExpiredCallback();
  }
  // Redirect to signin
  window.location.href = '/signin';
}

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  // DRF simplejwt TokenRefreshView: expects { refresh }, returns { access }
  const res = await fetch(getApiUrl("/auth/refresh/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    handleTokenExpiration();
    return null;
  }
  const data = await res.json();

  const newAccess = data?.access || data?.access_token || null;
  if (newAccess) localStorage.setItem(ACCESS_TOKEN_KEY, newAccess);
  return newAccess;
}

/**
 * authFetch(endpoint, { auth: true })
 * - endpoint should be like "/orders/" (API_CONFIG.baseURL is prepended)
 * - when auth=true, attaches Bearer access_token
 * - on 401, tries one refresh and retries once
 */
export async function authFetch(endpoint, options = {}) {
  const { auth = false, headers, ...rest } = options;

  const doRequest = () => {
    const h = new Headers(headers || {});
    if (auth) {
      const token = getAccessToken();
      if (token) h.set("Authorization", `Bearer ${token}`);
    }
    if (!h.has("Accept")) h.set("Accept", "application/json");
    return fetch(getApiUrl(endpoint), { ...rest, headers: h });
  };

  let res = await doRequest();
  if (auth && res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) res = await doRequest();
  }

  return res;
}
