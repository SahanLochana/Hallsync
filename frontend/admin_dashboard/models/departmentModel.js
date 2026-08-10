/**
 * Department Model — models/departmentModel.js
 * Defines default state, filter options, and mapping helpers
 * for Department management page.
 */

export const SEMESTER_OPTIONS = [
  "All",
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8",
];

export const TYPE_OPTIONS = ["All", "Compulsory", "Elective"];

export const initialDepartmentFilterState = {
  search: "",
  departmentCode: "All",
  semester: "All",
  type: "All",
};
