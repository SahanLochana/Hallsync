/**
 * Central HTTP API Client — services/apiClient.js
 * Manages base URL, automatic authorization token injection, error handling, and JSON parsing.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
export const TOKEN_KEY = "hallsync_admin_token";

/**
 * Gets the current authorization token from sessionStorage.
 * @returns {string|null}
 */
export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

/**
 * Clears session token and redirects to login if unauthenticated.
 */
export function handleUnauthorized() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(TOKEN_KEY);
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }
}

/**
 * Custom wrapper around fetch API.
 * @param {string} endpoint - API path (e.g. "/users/")
 * @param {RequestInit} [options={}] - Fetch configuration options
 * @returns {Promise<any>}
 */
export async function apiClient(endpoint, options = {}) {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const headers = { ...options.headers };

  // Set Content-Type to application/json if body exists and is not FormData
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  // Inject Authorization token if present in sessionStorage
  const token = getAuthToken();
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      handleUnauthorized();
      const errData = await response.json().catch(() => ({}));
      throw new Error(
        errData.detail || "Unauthorized access. Please log in again.",
      );
    }

    // Attempt to parse JSON response
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        typeof data === "object" && data.detail
          ? data.detail
          : typeof data === "string" && data
            ? data
            : `Request failed with status ${response.status}`;
      const err = new Error(errorMessage);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

/** Convenient HTTP method helpers */
apiClient.get = (endpoint, options = {}) =>
  apiClient(endpoint, { ...options, method: "GET" });
apiClient.post = (endpoint, body, options = {}) =>
  apiClient(endpoint, {
    ...options,
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
apiClient.put = (endpoint, body, options = {}) =>
  apiClient(endpoint, {
    ...options,
    method: "PUT",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
apiClient.delete = (endpoint, options = {}) =>
  apiClient(endpoint, { ...options, method: "DELETE" });

export default apiClient;
