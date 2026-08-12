/**
 * Auth Model — LOGIN
 * Defines the shape of the login form state and validation rules.
 */

/** Initial state for the login form */
export const initialLoginState = {
  adminId: "",
  password: "",
  showPassword: false,
  isLoading: false,
  error: null,
};

/**
 * Client-side validation for admin login fields.
 * @param {string} adminId
 * @param {string} password
 * @returns {string|null}
 */
export function validateLoginForm(adminId, password) {
  if (!adminId || !adminId.trim()) {
    return "Please enter your Admin ID.";
  }
  if (!password || !password.trim()) {
    return "Please enter your Password.";
  }
  return null;
}
