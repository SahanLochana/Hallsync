/**
 * Hall Model — models/hallModel.js
 * Defines the shape of hall state and filter options.
 *
 * Shape of a single hall entry:
 * {
 *   id:           string  — same as hallId (frontend key)
 *   hallId:       string  — e.g. "LH001"
 *   name:         string  — e.g. "New Lecture Hall"
 *   capacity:     number  — seating capacity
 *   availability: boolean — true = available, false = unavailable
 *   latitude:     number | null
 *   longitude:    number | null
 * }
 */

/** Initial filter/search state */
export const initialHallFilterState = {
  search: "",
  availability: "All",
};

/** Availability filter options */
export const AVAILABILITY_OPTIONS = ["All", "Available", "Unavailable"];
