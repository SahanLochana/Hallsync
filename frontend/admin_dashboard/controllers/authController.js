/**
 * Auth Controller — LOGIN
 * Handles all business logic for admin login, session management, and logout.
 */

import { validateLoginForm } from "../models/authModel";
import apiService from "../services/apiService";
import { TOKEN_KEY, getAuthToken } from "../services/apiClient";

export { TOKEN_KEY };

/**
 * Called when the user changes the admin ID input.
 */
export function handleAdminIdChange(e, setAdminId, setError) {
  setAdminId(e.target.value);
  setError(null);
}

/**
 * Called when the user changes the password input.
 */
export function handlePasswordChange(e, setPassword, setError) {
  setPassword(e.target.value);
  setError(null);
}

/**
 * Toggles password visibility.
 */
export function handleTogglePassword(setShowPassword) {
  setShowPassword((prev) => !prev);
}

/**
 * Main login handler — validates credentials, calls backend API, stores JWT in sessionStorage.
 */
export async function handleLogin({
  adminId,
  password,
  setError,
  setIsLoading,
  setAdminId,
  setPassword,
  onSuccess,
}) {
  const validationError = validateLoginForm(adminId, password);
  if (validationError) {
    setError(validationError);
    return;
  }

  setIsLoading(true);
  setError(null);

  try {
    const data = await apiService.auth.login(adminId.trim(), password.trim());

    if (data && data.token) {
      sessionStorage.setItem(TOKEN_KEY, data.token);

      if (setAdminId) setAdminId("");
      if (setPassword) setPassword("");

      if (onSuccess) onSuccess();
    } else {
      throw new Error("No authorization token received.");
    }
  } catch (err) {
    setError(err?.message || "Login failed. Please check your credentials.");
  } finally {
    setIsLoading(false);
  }
}

/**
 * Verifies current session token stored in sessionStorage.
 * @returns {Promise<boolean>}
 */
export async function verifyAdminSession() {
  if (typeof window === "undefined") return false;
  const token = getAuthToken();
  if (!token) return false;

  try {
    const data = await apiService.auth.verifyToken(token);
    return data && data.valid === true;
  } catch (err) {
    console.error("Token verification error:", err);
    return false;
  }
}

/**
 * Handles explicit admin logout.
 */
export function handleLogout(router) {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(TOKEN_KEY);
  }
  if (router) {
    router.push("/login");
  } else {
    window.location.href = "/login";
  }
}

export function handleForgotPassword(onForgotPassword) {
  onForgotPassword();
}
