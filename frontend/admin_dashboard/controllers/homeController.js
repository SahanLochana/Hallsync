/**
 * Home Controller — controllers/homeController.js
 * Business logic and API calls for the Admin Dashboard Home page.
 */

const API_BASE = "http://localhost:8000/api";

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
    const [usersRes, hallsRes] = await Promise.all([
      fetch(`${API_BASE}/users/`),
      fetch(`${API_BASE}/halls/`),
    ]);

    if (!usersRes.ok) throw new Error("Failed to fetch user data.");
    if (!hallsRes.ok) throw new Error("Failed to fetch hall data.");

    const usersData = await usersRes.json();
    const hallsData = await hallsRes.json();

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

  // Try adding to existing semester first
  const response = await fetch(`${API_BASE}/modules/${encodeURIComponent(semester)}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(itemPayload),
  });

  if (response.status === 404) {
    // Semester document doesn't exist yet, create it first
    const createSemesterRes = await fetch(`${API_BASE}/modules/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        semester,
        modules: [itemPayload],
      }),
    });

    if (!createSemesterRes.ok) {
      const errData = await createSemesterRes.json().catch(() => ({}));
      throw new Error(errData.detail || "Failed to create module.");
    }
    return;
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || "Failed to add module.");
  }
}
