/**
 * Home Controller — controllers/homeController.js
 * Business logic and API calls for the Admin Dashboard Home page.
 */

import apiService from "../services/apiService";

/**
 * Fetches user and hall stats in parallel and updates stats state.
 * @param {Function} setStats     - React setter for stats object
 * @param {Function} setIsLoading - React setter for loading state
 * @param {Function} setError     - React setter for error state
 */
export async function fetchDashboardStats(setStats, setIsLoading, setError) {
  setIsLoading(true);
  setError(null);

  try {
    const [usersData, hallsData] = await Promise.all([
      apiService.users.getAll(),
      apiService.halls.getAll(),
    ]);

    const usersList = usersData.response || [];
    const hallsList = hallsData.response || [];

    let lecturersCount = 0;
    let studentsCount = 0;

    usersList.forEach((u) => {
      const role = (u.role || "").toLowerCase();
      if (role === "lecturer") {
        lecturersCount++;
      } else if (role === "student") {
        studentsCount++;
      }
    });

    let availableHalls = 0;
    let unavailableHalls = 0;

    hallsList.forEach((h) => {
      if (h.availability) {
        availableHalls++;
      } else {
        unavailableHalls++;
      }
    });

    setStats({
      totalUsers: usersList.length,
      lecturersCount,
      studentsCount,
      totalHalls: hallsList.length,
      availableHalls,
      unavailableHalls,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    setError(err?.message || "Failed to load dashboard statistics.");
  } finally {
    setIsLoading(false);
  }
}

/**
 * Creates a module under a specified semester.
 * @param {Object} form - { semester, moduleId, name }
 */
export async function addModule(form) {
  const semester = form.semester;
  const itemPayload = {
    module_id: form.moduleId.trim(),
    name: form.name.trim(),
  };

  try {
    await apiService.modules.addItem(semester, itemPayload);
  } catch (err) {
    if (err.status === 404) {
      // Semester document doesn't exist yet, create it first
      await apiService.modules.createSemester({
        semester,
        modules: [itemPayload],
      });
    } else {
      throw err;
    }
  }
}
