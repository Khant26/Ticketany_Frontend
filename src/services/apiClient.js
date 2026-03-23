import { API_CONFIG, getApiUrl } from "../config/api";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_DATA_KEY = "user_data";
export const AUTH_REQUIRED_EVENT = "authRequired";

// Global logout callback - set by AuthContext
let onTokenExpiredCallback = null;
let isHandlingTokenExpiration = false;

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

export function clearAuthStorage() {
  clearTokens();
  localStorage.removeItem(USER_DATA_KEY);
}

function decodeTokenPayload(token) {
  try {
    if (!token || typeof token !== "string" || !token.includes(".")) {
      return null;
    }

    const [, payloadPart] = token.split(".");
    if (!payloadPart) return null;

    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeTokenPayload(token);
  if (!payload || typeof payload.exp !== "number") {
    return true;
  }

  return payload.exp <= Math.floor(Date.now() / 1000);
}

function handleTokenExpiration() {
  if (isHandlingTokenExpiration) return;
  isHandlingTokenExpiration = true;
  console.log('🔐 Token expired - logging out');
  clearAuthStorage();
  if (onTokenExpiredCallback) {
    onTokenExpiredCallback();
  } else {
    window.dispatchEvent(new Event("userLoginChanged"));
    window.dispatchEvent(new CustomEvent(AUTH_REQUIRED_EVENT, {
      detail: { reason: "sessionExpired" },
    }));
  }

  window.setTimeout(() => {
    isHandlingTokenExpiration = false;
  }, 0);
}

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh || isTokenExpired(refresh)) {
    handleTokenExpiration();
    return null;
  }

  // DRF simplejwt TokenRefreshView: expects { refresh }, returns { access }
  try {
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
  } catch {
    handleTokenExpiration();
    return null;
  }
}

async function isExpiredSessionResponse(response) {
  if (!response || response.ok) return false;
  if (response.status === 401) return true;

  try {
    const cloned = response.clone();
    const contentType = cloned.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await cloned.json();
      const detail = String(data?.detail || data?.message || data?.error || "").toLowerCase();
      return data?.code === "token_not_valid" || detail.includes("token not valid");
    }

    const text = (await cloned.text()).toLowerCase();
    return text.includes("token_not_valid") || text.includes("token not valid");
  } catch {
    return false;
  }
}

export async function ensureValidSession({ notify = true } = {}) {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (!accessToken) {
    if (refreshToken) {
      return !!(await refreshAccessToken());
    }

    if (notify && localStorage.getItem(USER_DATA_KEY)) {
      handleTokenExpiration();
    }

    return false;
  }

  if (!isTokenExpired(accessToken)) {
    return true;
  }

  if (refreshToken) {
    return !!(await refreshAccessToken());
  }

  if (notify) {
    handleTokenExpiration();
  }

  return false;
}

/**
 * authFetch(endpoint, { auth: true })
 * - endpoint should be like "/orders/" (API_CONFIG.baseURL is prepended)
 * - when auth=true, attaches Bearer access_token
 * - on 401, tries one refresh and retries once
 */
export async function authFetch(endpoint, options = {}) {
  const { auth = false, headers, ...rest } = options;

  if (auth) {
    const validSession = await ensureValidSession({ notify: true });
    if (!validSession) {
      return new Response(JSON.stringify({
        detail: "Session expired",
        code: "token_not_valid",
      }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  }

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

  if (auth && await isExpiredSessionResponse(res)) {
    handleTokenExpiration();
  }

  return res;
}
