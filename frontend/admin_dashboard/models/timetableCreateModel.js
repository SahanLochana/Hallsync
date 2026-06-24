/**
 * Timetable Create Model — models/timetableCreateModel.js
 *
 * Defines shape of the timetable meta-data form (name, department, year).
 * Grid constants (DAYS, HOURS, etc.) are re-exported from timetableViewModel.
 */

// ── Re-exports so the view only needs to import from one model ────────────────
export { DAYS, HOURS, HALF_HOURS, formatHour, generateId } from "./timetableViewModel";

// ── Timetable meta-data shape ─────────────────────────────────────────────────

/** Initial state for the timetable meta form */
export const INITIAL_META = {
  name:       "",
  department: "",
  year:       "",
};

/** Department options for the dropdown */
export const DEPARTMENT_OPTIONS = [
  "Information Systems",
  "Computer Science",
  "Software Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Business Administration",
];

/** Year options for the dropdown */
export const YEAR_OPTIONS = [
  "2022/2023",
  "2023/2024",
  "2024/2025",
  "2025/2026",
];

// ── localStorage key for the timetable list ───────────────────────────────────
export const LS_TIMETABLES_KEY = "hallsync_timetables";

/** Load the timetable list from localStorage */
export function loadTimetableList() {
  try {
    const raw = localStorage.getItem(LS_TIMETABLES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

/** Save the timetable list to localStorage */
export function saveTimetableList(list) {
  try {
    localStorage.setItem(LS_TIMETABLES_KEY, JSON.stringify(list));
  } catch (_) {}
}
