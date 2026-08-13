/**
 * Timetable Controller — controllers/timetableController.js
 * All business logic for the timetable list page.
 * The View (TimetablePage.jsx) calls these functions.
 */

import apiService from "../services/apiService";

/**
 * Fetches the list of timetables from the backend API.
 * @param {Function} setTimetables — React state setter
 * @param {Function} setIsLoading  — React state setter
 * @param {Function} setError      — React state setter
 */
export async function fetchTimetables(setTimetables, setIsLoading, setError) {
  setIsLoading(true);
  setError(null);
  try {
    const data = await apiService.timetables.getAll();
    setTimetables(data.response || []);
  } catch (err) {
    setError(err?.message || "Failed to load timetables.");
  } finally {
    setIsLoading(false);
  }
}

/**
 * Filters timetables by year and department.
 * Pure function — no side effects.
 * @param {Array}  timetables   — full list from state
 * @param {string} year         — selected year filter
 * @param {string} department   — selected department filter
 * @returns {Array} filtered list
 */
export function filterTimetables(timetables, year, department) {
  return timetables.filter((t) => {
    const matchYear = year === "All" || t.year === year;
    const matchDept = department === "All" || t.department === department;
    return matchYear && matchDept;
  });
}

/**
 * Called when the year filter dropdown changes.
 * @param {string}   value    — selected value
 * @param {Function} setYear  — React state setter
 */
export function handleYearFilter(value, setYear) {
  setYear(value);
}

/**
 * Called when the department filter dropdown changes.
 * @param {string}   value          — selected value
 * @param {Function} setDepartment  — React state setter
 */
export function handleDepartmentFilter(value, setDepartment) {
  setDepartment(value);
}

/**
 * Called when the user clicks "Create" button.
 * Delegates navigation to the View.
 * @param {Function} onNavigate — e.g. router.push("/timetable/create")
 */
export function handleCreateTimetable(onNavigate) {
  onNavigate();
}

/**
 * Called when the user clicks on a timetable row.
 * Delegates navigation to the View.
 * @param {string}   id         — timetable ID
 * @param {Function} onNavigate — e.g. router.push(`/timetable/view?id=${id}`)
 */
export function handleOpenTimetable(id, onNavigate) {
  onNavigate(id);
}
