/**
 * Timetable Create Controller — controllers/timetableCreateController.js
 *
 * Business logic for the timetable creation page.
 * The View (TimetableCreatePage.jsx) calls these functions.
 */

import { generateId } from "../models/timetableCreateModel";
import apiService from "../services/apiService";

// ── Department fetching ───────────────────────────────────────────────────────

/**
 * Fetches department options from the backend API.
 *
 * @param {Function} setDepartmentOptions - React state setter for department name options
 * @param {Function} [setIsLoading]       - Optional React state setter for loading indicator
 * @param {Function} [setError]          - Optional React state setter for error message
 */
export async function fetchDepartmentOptions(setDepartmentOptions, setIsLoading, setError) {
  if (setIsLoading) setIsLoading(true);
  if (setError) setError(null);
  try {
    const data = await apiService.departments.getAll();
    const rawList = data?.response || [];
    const names = rawList
      .map((d) => d.departmentName)
      .filter(Boolean);
    setDepartmentOptions(names);
    return names;
  } catch (err) {
    console.error("Failed to fetch departments for timetable creation:", err);
    if (setError) setError(err?.message || "Failed to load departments.");
    return [];
  } finally {
    if (setIsLoading) setIsLoading(false);
  }
}

// ── Draft lecture management ──────────────────────────────────────────────────

/**
 * Add a new lecture to the draft (in-memory only, not persisted yet).
 *
 * @param {Object}   newLec      — lecture fields (without id)
 * @param {Array}    lectures    — current draft lectures array
 * @param {Function} setLectures — React state setter
 * @param {Function} onDone      — callback to close modal
 */
export function handleAddDraftLecture(newLec, lectures, setLectures, onDone) {
  const entry = { ...newLec, lec_id: generateId() };
  setLectures([...lectures, entry]);
  onDone();
}

/**
 * Remove a draft lecture (before saving).
 *
 * @param {string}   id          — lecture ID to remove
 * @param {Array}    lectures    — current draft lectures array
 * @param {Function} setLectures — React state setter
 */
export function handleRemoveDraftLecture(id, lectures, setLectures) {
  setLectures(lectures.filter((l) => l.lec_id !== id));
}

// ── Save timetable ────────────────────────────────────────────────────────────

/**
 * Persist the new timetable to the backend API and navigate back to /timetable.
 *
 * @param {Object}   meta      — { name, department, year }
 * @param {Array}    lectures  — the draft lecture list
 * @param {Object}   router    — Next.js router
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function handleSaveTimetable(meta, lectures, router) {
  // Basic validation
  if (!meta.name.trim()) return { ok: false, error: "Timetable name is required." };
  if (!meta.department)  return { ok: false, error: "Please select a department." };
  if (!meta.year)        return { ok: false, error: "Please select a year." };

  const payload = {
    name:         meta.name.trim(),
    department:   meta.department,
    year:         meta.year,
    lectures:     lectures.map((l) => ({
      lec_id:       l.lec_id,
      lectureName:  l.lectureName,
      lecturerName: l.lecturerName,
      day:          l.day,
      startHour:    Number(l.startHour),
      endHour:      Number(l.endHour),
      location:     l.location,
    })),
  };

  try {
    await apiService.timetables.create(payload);
    router.push("/timetable");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message || "Network error occurred." };
  }
}
