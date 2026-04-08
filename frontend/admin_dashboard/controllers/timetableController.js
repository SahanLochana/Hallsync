/**
 * Timetable Controller — controllers/timetableController.js
 * All business logic for the timetable list page.
 * The View (TimetablePage.jsx) calls these functions.
 * Replace TODO comments with real API calls when backend is ready.
 */

import { SAMPLE_TIMETABLES } from "../models/timetableModel";

/**
 * Fetches the list of timetables.
 * TODO: Replace with real API call — getTimetables()
 * @param {Function} setTimetables — React state setter
 * @param {Function} setIsLoading  — React state setter
 * @param {Function} setError      — React state setter
 */
export async function fetchTimetables(setTimetables, setIsLoading, setError) {
  setIsLoading(true);
  setError(null);
  try {
    // TODO: const data = await timetableService.getAll();
    // Using sample data until backend is connected
    setTimetables(SAMPLE_TIMETABLES);
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
 * TODO: handleCreateTimetable — navigate to timetable create page
 */
export function handleCreateTimetable(onNavigate) {
  onNavigate();
}

/**
 * Called when the user clicks on a timetable row.
 * Delegates navigation to the View.
 * @param {string}   id         — timetable ID
 * @param {Function} onNavigate — e.g. router.push(`/timetable/${id}`)
 * TODO: handleOpenTimetable — navigate to timetable detail/edit page
 */
export function handleOpenTimetable(id, onNavigate) {
  onNavigate(id);
}
