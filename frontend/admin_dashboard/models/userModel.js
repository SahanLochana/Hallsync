/**
 * User Model — models/userModel.js
 * Defines the shape of user state, role options,
 * and sample/mock data for frontend development.
 * Replace SAMPLE_USERS with real API data when backend is ready.
 */

/**
 * Shape of a single user entry:
 * {
 *   id:           string  — internal unique ID (e.g. "u001")
 *   universityId: string  — e.g. "SE/2021/001" (student uni ID) or "LEC/001" (lecturer ID)
 *   name:         string  — full name
 *   email:        string
 *   role:         "Lecturer" | "Student"
 *   department:   string  — e.g. "Software Engineering"
 *   faculty:      string  — e.g. "Computing"
 *   academicYear: string  — e.g. "3rd Year" (only for Student)
 * }
 */

/** Initial filter/search state */
export const initialUserFilterState = {
  search: "",
  role: "Student",
};

/** Available role filter options */
export const ROLE_OPTIONS = ["Student", "Lecturer"];

/** Role options for form selects (no "All") */
export const ROLE_FORM_OPTIONS = ["Student", "Lecturer"];
