/**
 * Auth Controller — LOGIN
 * Handles all business logic for the login page.
 * The View (page.js) calls these functions; they update
 * state via the provided setState callbacks.
 *
 * When the backend is ready, replace the placeholder
 * comment inside `handleLogin` with the real API call.
 */

import { validateLoginForm } from "../models/authModel";

/**
 * Called when the user changes the email input.
 * @param {React.ChangeEvent} e
 * @param {Function} setEmail  — React state setter
 * @param {Function} setError  — React state setter
 */
export function handleEmailChange(e, setEmail, setError) {
  setEmail(e.target.value);
  setError(null); // clear error on new input
}

/**
 * Called when the user changes the password input.
 * @param {React.ChangeEvent} e
 * @param {Function} setPassword — React state setter
 * @param {Function} setError   — React state setter
 */
export function handlePasswordChange(e, setPassword, setError) {
  setPassword(e.target.value);
  setError(null);
}

/**
 * Toggles password visibility.
 * @param {Function} setShowPassword — React state setter (boolean)
 */
export function handleTogglePassword(setShowPassword) {
  setShowPassword((prev) => !prev);
}

/**
 * Main login handler — called when the user submits the form.
 * Validates inputs, then calls the backend login API.
 *
 * @param {Object} params
 * @param {string}   params.email
 * @param {string}   params.password
 * @param {Function} params.setError
 * @param {Function} params.setIsLoading
 * @param {Function} params.onSuccess    — called after successful login (e.g. router.push)
 */
export async function handleLogin({ email, password, setError, setIsLoading, onSuccess }) {
  // 1. Client-side validation
  const validationError = validateLoginForm(email, password);
  if (validationError) {
    setError(validationError);
    return;
  }

  setIsLoading(true);
  setError(null);

  try {
    // 2. TODO: Call backend login API
    // Example: const response = await loginAdmin({ email, password });
    // Replace this block with the actual API service call when backend is ready.
    // --- loginService.login(email, password) ---

    // 3. On success, navigate to the dashboard
    // onSuccess() will call router.push("/dashboard") from the View
    onSuccess();
  } catch (err) {
    // 4. Display server-side error to the user
    setError(err?.message || "Login failed. Please check your credentials.");
  } finally {
    setIsLoading(false);
  }
}

/**
 * Called when the user clicks "Forgot password?"
 * Delegates navigation to the View via the callback.
 * @param {Function} onForgotPassword — e.g. router.push("/forgot-password")
 */
export function handleForgotPassword(onForgotPassword) {
  // TODO: Navigate to forgot-password page
  onForgotPassword();
}
