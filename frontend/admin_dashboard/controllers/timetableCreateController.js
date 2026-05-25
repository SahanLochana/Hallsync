/**
 * Timetable Create Controller — controllers/timetableCreateController.js
 *
 * Business logic for the timetable creation page.
 * The View (TimetableCreatePage.jsx) calls these functions.
 * Replace TODO comments with API calls when backend is ready.
 */

import { generateId, loadTimetableList, saveTimetableList } from "../models/timetableCreateModel";

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
  const entry = { ...newLec, id: generateId() };
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
  setLectures(lectures.filter((l) => l.id !== id));
}

// ── Save timetable ────────────────────────────────────────────────────────────

/**
 * Persist the new timetable to localStorage and navigate back to /timetable.
 * TODO: Replace with API call — createTimetable(meta, lectures)
 *
 * @param {Object}   meta      — { name, department, year }
 * @param {Array}    lectures  — the draft lecture list
 * @param {Function} router    — Next.js router
 * @returns {{ ok: boolean, error?: string }}
 */
export function handleSaveTimetable(meta, lectures, router) {
  // Basic validation
  if (!meta.name.trim()) return { ok: false, error: "Timetable name is required." };
  if (!meta.department)  return { ok: false, error: "Please select a department." };
  if (!meta.year)        return { ok: false, error: "Please select a year." };

  const newEntry = {
    id:           generateId(),
    name:         meta.name.trim(),
    department:   meta.department,
    year:         meta.year,
    lastModified: new Date().toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    }),
    lectures,
  };

  const existing = loadTimetableList();
  saveTimetableList([...existing, newEntry]);

  // TODO: await timetableService.create(newEntry);
  router.push("/timetable");
  return { ok: true };
}
