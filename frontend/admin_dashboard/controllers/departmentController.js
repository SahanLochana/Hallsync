/**
 * Department Controller — controllers/departmentController.js
 * Business logic for fetching and filtering department data.
 */

import apiService from "../services/apiService";

/**
 * Normalizes and formats a department object from backend response.
 */
export function mapDepartment(dept) {
  return {
    departmentCode: dept.departmentCode || "",
    departmentName: dept.departmentName || "",
    degreePrograms: dept.degreePrograms || [],
    lectures: (dept.lectures || []).map((lec) => ({
      semester: lec.semester,
      courseCode: lec.courseCode || "",
      courseTitle: lec.courseTitle || "",
      credits: lec.credits !== undefined ? lec.credits : null,
      type: lec.type || "Compulsory",
      nonGpa: Boolean(lec.nonGpa),
    })),
  };
}

/**
 * Fetches all departments from the backend API.
 */
export async function fetchDepartments(setDepartments, setIsLoading, setError) {
  setIsLoading(true);
  setError(null);
  try {
    const data = await apiService.departments.getAll();
    const rawList = data.response || [];
    setDepartments(rawList.map(mapDepartment));
  } catch (err) {
    console.error("Failed to fetch departments:", err);
    setError(err?.message || "Failed to load departments from database.");
  } finally {
    setIsLoading(false);
  }
}

/**
 * Filters a department's lecture list by search query, semester, and course type.
 */
export function filterLectures(lectures, search = "", semester = "All", type = "All") {
  const q = search.toLowerCase().trim();
  return (lectures || []).filter((lec) => {
    const matchSearch =
      !q ||
      lec.courseCode.toLowerCase().includes(q) ||
      lec.courseTitle.toLowerCase().includes(q);

    let matchSemester = true;
    if (semester !== "All") {
      const semNum = parseInt(semester.replace("Semester ", ""), 10);
      if (!isNaN(semNum)) {
        matchSemester = lec.semester === semNum;
      }
    }

    const matchType =
      type === "All" || lec.type.toLowerCase() === type.toLowerCase();

    return matchSearch && matchSemester && matchType;
  });
}

/**
 * Calculates summary metrics for departments.
 */
export function getDepartmentStats(departments) {
  const totalDepartments = departments.length;
  const totalPrograms = departments.reduce(
    (acc, d) => acc + (d.degreePrograms?.length || 0),
    0
  );
  const totalLectures = departments.reduce(
    (acc, d) => acc + (d.lectures?.length || 0),
    0
  );
  return { totalDepartments, totalPrograms, totalLectures };
}
