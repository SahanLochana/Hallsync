/**
 * Timetable View Controller — controllers/timetableViewController.js
 * All business logic for the timetable grid view page.
 *
 * The View (TimetableViewPage.jsx) calls these functions.
 */

import { generateId } from "../models/timetableViewModel";
import apiService from "../services/apiService";

// ── Add ───────────────────────────────────────────────────────────────────────

/**
 * Called when the admin confirms adding a new lecture from the AddLectureModal.
 * Appends to state + persists to the backend.
 *
 * @param {Object}   newLec      — lecture fields (without id)
 * @param {Array}    lectures    — current lectures array from state
 * @param {string}   timetableId — the active timetable database ID
 * @param {Function} setLectures — React state setter
 * @param {Function} onDone      — callback to close modal
 * @param {Function} setError    — React state error setter
 */
export async function handleAddLecture(newLec, lectures, timetableId, setLectures, onDone, setError) {
  if (setError) setError(null);
  const entry = { ...newLec, lec_id: generateId() };
  const updated = [...lectures, entry];

  try {
    const data = await apiService.timetables.update(timetableId, { lectures: updated });
    setLectures(data.lectures || []);
    onDone();
  } catch (err) {
    if (setError) {
      setError(err?.message || "Failed to add lecture.");
    } else {
      alert(err?.message || "Failed to add lecture.");
    }
  }
}

// ── Initialization ────────────────────────────────────────────────────────────

/**
 * Load lectures from backend into state on mount.
 *
 * @param {string}   timetableId — the active timetable database ID
 * @param {Function} setLectures — React state setter for lectures
 * @param {Function} setMeta     — React state setter for metadata
 * @param {Function} setIsLoading — React state setter for loading state
 * @param {Function} setError    — React state setter for errors
 */
export async function initLectures(timetableId, setLectures, setMeta, setIsLoading, setError) {
  setIsLoading(true);
  setError(null);
  try {
    const data = await apiService.timetables.getById(timetableId);
    setLectures(data.lectures || []);
    setMeta({ name: data.name, department: data.department, year: data.year });
  } catch (err) {
    setError(err?.message || "Failed to load timetable lectures.");
  } finally {
    setIsLoading(false);
  }
}

// ── Lecture selection (popup trigger) ────────────────────────────────────────

/**
 * Called when the user clicks a lecture block in the grid.
 * Opens the detail popup.
 * @param {Object}   lecture        — the clicked lecture object
 * @param {Function} setSelected    — set the selected lecture
 * @param {Function} setShowDetail  — show the detail modal
 */
export function handleLectureClick(lecture, setSelected, setShowDetail) {
  setSelected(lecture);
  setShowDetail(true);
}

/**
 * Close the detail popup and clear selection.
 */
export function handleCloseDetail(setSelected, setShowDetail) {
  setSelected(null);
  setShowDetail(false);
}

// ── Edit ──────────────────────────────────────────────────────────────────────

/**
 * Called when the user confirms saving edited lecture details.
 * Updates array in state + persists to backend.
 *
 * @param {Object}   edited       — the edited lecture object
 * @param {Array}    lectures     — current lectures array from state
 * @param {string}   timetableId  — the active timetable database ID
 * @param {Function} setLectures  — React state setter
 * @param {Function} onDone       — callback to close modal
 * @param {Function} setError     — React state error setter
 */
export async function handleSaveEdit(edited, lectures, timetableId, setLectures, onDone, setError) {
  if (setError) setError(null);
  const updated = lectures.map((l) => (l.lec_id === edited.lec_id ? edited : l));

  try {
    const data = await apiService.timetables.update(timetableId, { lectures: updated });
    setLectures(data.lectures || []);
    onDone();
  } catch (err) {
    if (setError) {
      setError(err?.message || "Failed to update lecture.");
    } else {
      alert(err?.message || "Failed to update lecture.");
    }
  }
}

// ── Delete Lecture ────────────────────────────────────────────────────────────

/**
 * Called when the user confirms deleting a lecture.
 * Removes from state + persists to backend.
 *
 * @param {string}   id          — lecture ID to remove
 * @param {Array}    lectures    — current lectures array from state
 * @param {string}   timetableId — the active timetable database ID
 * @param {Function} setLectures — React state setter
 * @param {Function} onDone      — callback to close modal
 * @param {Function} setError    — React state error setter
 */
export async function handleConfirmDelete(id, lectures, timetableId, setLectures, onDone, setError) {
  if (setError) setError(null);
  const updated = lectures.filter((l) => l.lec_id !== id);

  try {
    const data = await apiService.timetables.update(timetableId, { lectures: updated });
    setLectures(data.lectures || []);
    onDone();
  } catch (err) {
    if (setError) {
      setError(err?.message || "Failed to delete lecture.");
    } else {
      alert(err?.message || "Failed to delete lecture.");
    }
  }
}

// ── Delete Timetable ──────────────────────────────────────────────────────────

/**
 * Called when the admin confirms deleting the entire timetable.
 * Deletes from backend and redirects to list.
 *
 * @param {string}   timetableId — the active timetable database ID
 * @param {Object}   router      — Next.js router
 */
export async function handleDeleteTimetable(timetableId, router, setIsDeleting) {
  if (!confirm("Are you sure you want to delete this entire timetable? This action cannot be undone.")) {
    return;
  }
  if (setIsDeleting) setIsDeleting(true);
  try {
    await apiService.timetables.delete(timetableId);
    router.push("/timetable");
  } catch (err) {
    alert(err?.message || "Failed to delete timetable.");
  } finally {
    if (setIsDeleting) setIsDeleting(false);
  }
}

// ── Week navigation ───────────────────────────────────────────────────────────

/**
 * Navigate to the previous week.
 * @param {Date}     weekStart   — current week start date
 * @param {Function} setWeekStart — React state setter
 */
export function handlePrevWeek(weekStart, setWeekStart) {
  const d = new Date(weekStart);
  d.setDate(d.getDate() - 7);
  setWeekStart(d);
}

/**
 * Navigate to the next week.
 */
export function handleNextWeek(weekStart, setWeekStart) {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 7);
  setWeekStart(d);
}

/**
 * Format week range label — e.g. "April 5 - April 11"
 * @param {Date} weekStart
 * @returns {string}
 */
export function formatWeekLabel(weekStart) {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 4); // Mon → Fri
  const opts = { month: "long", day: "numeric" };
  return `${weekStart.toLocaleDateString("en-US", opts)} - ${end.toLocaleDateString("en-US", opts)}`;
}

/**
 * Get the date number for a given day index (0=Mon).
 * @param {Date}   weekStart
 * @param {number} dayIndex — 0–4
 * @returns {number}
 */
export function getDayDate(weekStart, dayIndex) {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + dayIndex);
  return d.getDate();
}

/**
 * Get the Monday of the current week.
 * @returns {Date}
 */
export function getCurrentWeekMonday() {
  const today = new Date();
  const day = today.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}
