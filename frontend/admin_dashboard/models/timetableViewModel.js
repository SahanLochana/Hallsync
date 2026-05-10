/**
 * Timetable View Model — models/timetableViewModel.js
 * Defines:
 *   - Shape of a lecture entry
 *   - Sample/initial lecture data
 *   - localStorage read/write helpers (auto-save)
 *
 * Replace INITIAL_LECTURES with real API data when backend is ready.
 */

const LS_KEY = "hallsync_timetable_lectures";

/** Days shown in the grid */
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

/** Whole-hour slots 8 am–5 pm — used for labels */
export const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

/**
 * Half-hour slots 8:00 – 16:30 → 18 cells (each cell = 30 min).
 * Last slot top edge is 16:30; bottom edge is 17:00 (5 pm).
 */
export const HALF_HOURS = Array.from({ length: 18 }, (_, i) => 8 + i * 0.5);
// [8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5]

/**
 * Human-readable time label.
 * 8   → "8 am"   |  8.5  → "8:30 am"
 * 13  → "1 pm"   |  13.5 → "1:30 pm"
 */
export function formatHour(h) {
  const whole = Math.floor(h);
  const half  = h % 1 !== 0;
  const mins  = half ? ":30" : "";
  if (whole === 12) return `12${mins} pm`;
  if (whole < 12)  return `${whole}${mins} am`;
  return `${whole - 12}${mins} pm`;
}

/**
 * Shape of a single lecture:
 * {
 *   id:           string  — unique identifier
 *   lectureName:  string  — e.g. "Software Engineering"
 *   lecturerName: string  — e.g. "Dr. John Smith"
 *   day:          string  — one of DAYS
 *   startHour:    number  — 8–17 (inclusive)
 *   endHour:      number  — startHour + duration (max 17)
 *   location:     string  — e.g. "Hall A - Room 101"
 * }
 */

/** Sample lecture data for frontend development */
export const INITIAL_LECTURES = [
  {
    id: "lec-1",
    lectureName: "Software Engineering",
    lecturerName: "Dr. Perera",
    day: "Monday",
    startHour: 8,
    endHour: 10,
    location: "Hall A - Room 101",
  },
  {
    id: "lec-2",
    lectureName: "Academic English II",
    lecturerName: "Ms. Fernando",
    day: "Monday",
    startHour: 10,
    endHour: 12,
    location: "Hall B - Room 203",
  },
  {
    id: "lec-3",
    lectureName: "Software Engineering",
    lecturerName: "Dr. Perera",
    day: "Monday",
    startHour: 13,
    endHour: 15,
    location: "Hall A - Room 101",
  },
  {
    id: "lec-4",
    lectureName: "Database Systems",
    lecturerName: "Prof. Silva",
    day: "Wednesday",
    startHour: 9,
    endHour: 11,
    location: "Hall C - Lab 01",
  },
  {
    id: "lec-5",
    lectureName: "Computer Networks",
    lecturerName: "Dr. Karunaratne",
    day: "Friday",
    startHour: 13,
    endHour: 15,
    location: "Hall A - Room 102",
  },
];

// ── localStorage helpers ──────────────────────────────────────────────────────

/** Load lectures from localStorage, or fall back to INITIAL_LECTURES */
export function loadLectures() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return INITIAL_LECTURES;
}

/** Save lectures array to localStorage */
export function saveLectures(lectures) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(lectures));
  } catch (_) {}
}

/** Generate a simple unique ID for new lectures */
export function generateId() {
  return `lec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
