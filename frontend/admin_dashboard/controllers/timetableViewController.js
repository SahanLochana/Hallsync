/**
 * Timetable View Controller — controllers/timetableViewController.js
 * All business logic for the timetable grid view page.
 *
 * The View (TimetableViewPage.jsx) calls these functions.
 * Replace TODO comments with API calls when backend is ready.
 */

import { loadLectures, saveLectures, generateId } from "../models/timetableViewModel";

// ── Add ───────────────────────────────────────────────────────────────────────

/**
 * Called when the admin confirms adding a new lecture from the AddLectureModal.
 * Appends to state + persists to localStorage.
 * TODO: Call API — createLecture(entry)
 *
 * @param {Object}   newLec      — lecture fields (without id)
 * @param {Array}    lectures    — current lectures array from state
 * @param {Function} setLectures — React state setter
 * @param {Function} onDone      — callback to close modal
 */
export function handleAddLecture(newLec, lectures, setLectures, onDone) {
  const entry = { ...newLec, id: generateId() };
  const updated = [...lectures, entry];
  setLectures(updated);
  saveLectures(updated); // auto-save to localStorage
  // TODO: await lectureService.create(entry);
  onDone();
}

// ── Initialization ────────────────────────────────────────────────────────────

/**
 * Load lectures from localStorage into state on mount.
 * TODO: Replace with API call — getTimetableById(id)
 * @param {Function} setLectures — React state setter
 */
export function initLectures(setLectures) {
  const data = loadLectures();
  setLectures(data);
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
 * Updates array in state + persists to localStorage.
 * TODO: Call API — updateLecture(editedLecture)
 *
 * @param {Object}   edited       — the edited lecture object
 * @param {Array}    lectures     — current lectures array from state
 * @param {Function} setLectures  — React state setter
 * @param {Function} onDone       — callback to close modal
 */
export function handleSaveEdit(edited, lectures, setLectures, onDone) {
  const updated = lectures.map((l) => (l.id === edited.id ? edited : l));
  setLectures(updated);
  saveLectures(updated); // auto-save to localStorage
  // TODO: await lectureService.update(edited);
  onDone();
}

// ── Delete ────────────────────────────────────────────────────────────────────

/**
 * Called when the user confirms deleting a lecture.
 * Removes from state + persists to localStorage.
 * TODO: Call API — deleteLecture(id)
 *
 * @param {string}   id          — lecture ID to remove
 * @param {Array}    lectures    — current lectures array from state
 * @param {Function} setLectures — React state setter
 * @param {Function} onDone      — callback to close modal
 */
export function handleConfirmDelete(id, lectures, setLectures, onDone) {
  const updated = lectures.filter((l) => l.id !== id);
  setLectures(updated);
  saveLectures(updated); // auto-save to localStorage
  // TODO: await lectureService.delete(id);
  onDone();
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
