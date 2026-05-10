/**
 * Timetable Model — models/timetableModel.js
 * Defines the shape of timetable state, filter options,
 * and sample/mock data for frontend development.
 * Replace SAMPLE_TIMETABLES with real API data when backend is ready.
 */

/** Initial filter state for the timetable list page */
export const initialFilterState = {
  year: "All",
  department: "All",
};

/** Shape of a single timetable entry */
// {
//   id: string,
//   name: string,          — e.g. "2021/2022 | Software Engineering"
//   department: string,
//   year: string,
//   lastModified: string,  — formatted date string
// }

/** Available year filter options */
export const YEAR_OPTIONS = ["All", "2021/2022", "2022/2023", "2023/2024", "2024/2025"];

/** Available department filter options */
export const DEPARTMENT_OPTIONS = [
  "All",
  "Software Engineering",
  "Computer Science",
  "Information Technology",
  "Electrical Engineering",
];

/** Sample timetable data — replace with API response */
export const SAMPLE_TIMETABLES = [
  { id: "1", name: "2021/2022 | Software Engineering", department: "Software Engineering", year: "2021/2022", lastModified: "2026.04.01  9:10am" },
  { id: "2", name: "2021/2022 | Software Engineering", department: "Software Engineering", year: "2021/2022", lastModified: "2026.04.01  9:10am" },
  { id: "3", name: "2021/2022 | Software Engineering", department: "Software Engineering", year: "2021/2022", lastModified: "2026.04.01  9:10am" },
  { id: "4", name: "2021/2022 | Software Engineering", department: "Software Engineering", year: "2021/2022", lastModified: "2026.04.01  9:10am" },
  { id: "5", name: "2021/2022 | Software Engineering", department: "Software Engineering", year: "2021/2022", lastModified: "2026.04.01  9:10am" },
  { id: "6", name: "2021/2022 | Software Engineering", department: "Software Engineering", year: "2021/2022", lastModified: "2026.04.01  9:10am" },
  { id: "7", name: "2021/2022 | Software Engineering", department: "Software Engineering", year: "2021/2022", lastModified: "2026.04.01  9:10am" },
];
