/**
 * Auth Model — LOGIN
 * Defines the shape of the login form state and any
 * data-related helpers (validation rules, initial state).
 * No API calls live here — that belongs in the controller.
 */

/** Initial state for the login form */
export const initialLoginState = {
  email: "",
  password: "",
  showPassword: false,
  isLoading: false,
  error: null,
};

/**
 * Simple client-side validation for login fields.
 * Returns an error string if invalid, or null if valid.
 * @param {string} email
 * @param {string} password
 * @returns {string|null}
 */
export function validateLoginForm(email, password) {
  if (!email || !email.includes("@")) {
    return "Please enter a valid email address.";
  }
  if (!password || password.length < 6) {
    return "Password must be at least 6 characters.";
  }
  return null;
}
