/**
 * User Controller — controllers/userController.js
 * All business logic for the user management pages.
 * The View (UsersPage.jsx) calls these functions.
 */

import * as XLSX from "xlsx";

// ── Data Fetching ──────────────────────────────────────────────────────────────

/**
 * Fetches the list of users from the backend.
 * @param {Function} setUsers     — React state setter
 * @param {Function} setIsLoading — React state setter
 * @param {Function} setError     — React state setter
 */
export async function fetchUsers(setUsers, setIsLoading, setError) {
  setIsLoading(true);
  setError(null);
  try {
    const response = await fetch("http://localhost:8000/api/users/");
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    // universityId is both the unique key and the display ID
    const mappedUsers = (data.response || []).map((u) => ({
      id: u.universityId,
      universityId: u.universityId,
      name: u.name,
      email: u.email,
      role: u.role
        ? u.role.charAt(0).toUpperCase() + u.role.slice(1)
        : "Student",
      department: u.department || "",
      faculty: u.faculty || "",
      academicYear: u.academicYear || "",
    }));
    setUsers(mappedUsers);
  } catch (err) {
    setError(err?.message || "Failed to load users.");
  } finally {
    setIsLoading(false);
  }
}

// ── Filtering ─────────────────────────────────────────────────────────────────

/**
 * Filters users by search term (name or universityId) and role.
 * Pure function — no side effects.
 * @param {Array}  users  — full list from state
 * @param {string} search — search term
 * @param {string} role   — selected role filter ("All" | "Admin" | "Lecturer" | "Student")
 * @returns {Array} filtered list
 */
export function filterUsers(users, search, role) {
  const q = search.toLowerCase().trim();
  return users.filter((u) => {
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.universityId.toLowerCase().includes(q);
    const matchRole = role === "All" || u.role === role;
    return matchSearch && matchRole;
  });
}

// ── Validation ────────────────────────────────────────────────────────────────

/**
 * Validates a user form object.
 * @param {Object} form — { universityId, name, email, role, department, faculty, academicYear }
 * @returns {Object} error map (empty = valid)
 */
export function validateUserForm(form) {
  const errors = {};
  if (!form.universityId?.trim()) {
    errors.universityId =
      form.role === "Lecturer"
        ? "Lecturer ID is required."
        : "University ID is required.";
  }
  if (!form.name?.trim()) errors.name = "Full name is required.";
  if (!form.email?.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!form.role) {
    errors.role = "Role is required.";
  } else if (!["Lecturer", "Student"].includes(form.role)) {
    errors.role = "Role must be Lecturer or Student.";
  }
  if (!form.department?.trim()) errors.department = "Department is required.";
  if (!form.faculty?.trim()) errors.faculty = "Faculty is required.";
  if (form.role === "Student" && !form.academicYear?.trim()) {
    errors.academicYear = "Academic Year is required.";
  }
  return errors;
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Adds a single new user. universityId is the primary identifier.
 * @param {Array}    users    — current user list from state
 * @param {Object}   form     — { universityId, name, email, role, department, faculty, academicYear }
 * @param {Function} setUsers — React state setter
 */
export async function addUser(users, form, setUsers) {
  const newUser = {
    universityId: form.universityId,
    name: form.name,
    email: form.email,
    role: form.role.toLowerCase(),
    department: form.department,
    faculty: form.faculty,
    academicYear: form.role === "Student" ? form.academicYear : null,
  };

  try {
    const response = await fetch("http://localhost:8000/api/users/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || "Failed to add user to database.");
    }

    const created = await response.json();
    const frontendUser = {
      id: created.universityId,
      universityId: created.universityId,
      name: created.name,
      email: created.email,
      role: created.role.charAt(0).toUpperCase() + created.role.slice(1),
      department: created.department,
      faculty: created.faculty,
      academicYear: created.academicYear || "",
    };

    setUsers([frontendUser, ...users]);
  } catch (err) {
    alert(err.message || "Failed to add user.");
    throw err;
  }
}

/**
 * Updates an existing user in the list.
 * The PUT URL uses universityId as the path param.
 * @param {Array}    users       — current user list from state
 * @param {Object}   updatedUser — full user object with updated fields
 * @param {Function} setUsers    — React state setter
 */
export async function editUser(users, updatedUser, setUsers) {
  const cleanUser = { ...updatedUser };
  if (cleanUser.role === "Lecturer") {
    cleanUser.academicYear = null;
  }

  const updatePayload = {
    universityId: cleanUser.universityId,
    name: cleanUser.name,
    email: cleanUser.email,
    role: cleanUser.role.toLowerCase(),
    department: cleanUser.department,
    faculty: cleanUser.faculty,
    academicYear: cleanUser.academicYear || null,
  };

  try {
    const response = await fetch(
      `http://localhost:8000/api/users/${encodeURIComponent(cleanUser.universityId)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      },
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || "Failed to update user in database.");
    }

    const updated = await response.json();
    const frontendUser = {
      id: updated.universityId,
      universityId: updated.universityId,
      name: updated.name,
      email: updated.email,
      role: updated.role.charAt(0).toUpperCase() + updated.role.slice(1),
      department: updated.department,
      faculty: updated.faculty,
      academicYear: updated.academicYear || "",
    };

    setUsers(
      users.map((u) =>
        u.universityId === frontendUser.universityId ? frontendUser : u,
      ),
    );
  } catch (err) {
    alert(err.message || "Failed to update user.");
    throw err;
  }
}

// ── Spreadsheet Import ────────────────────────────────────────────────────────

/**
 * Parses a spreadsheet file (CSV or XLSX) into an array of user-like objects.
 * Expected header columns: universityId, name, email, role, department, faculty, academicYear
 * @param {File} file — spreadsheet file object
 * @returns {Promise<{ rows: Array, errors: string[] }>}
 */
export async function parseSpreadsheetToUsers(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert sheet to 2D array of strings
        const sheetData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
        });

        if (sheetData.length < 2) {
          return resolve({
            rows: [],
            errors: ["Spreadsheet is empty or has no data rows."],
          });
        }

        // Clean headers: lowercase and remove spaces
        const header = sheetData[0].map((h) =>
          String(h).trim().toLowerCase().replace(/\s+/g, ""),
        );

        const required = [
          "universityid",
          "name",
          "email",
          "role",
          "department",
          "faculty",
        ];
        const missingHeaders = required.filter((r) => !header.includes(r));
        if (missingHeaders.length > 0) {
          return resolve({
            rows: [],
            errors: [`Missing required columns: ${missingHeaders.join(", ")}.`],
          });
        }

        const idxOf = (col) => header.indexOf(col);
        const rows = [];
        const errors = [];

        sheetData.slice(1).forEach((cols, i) => {
          if (!cols || cols.every((val) => String(val).trim() === "")) return;

          const universityId = String(cols[idxOf("universityid")] || "").trim();
          const name = String(cols[idxOf("name")] || "").trim();
          const email = String(cols[idxOf("email")] || "").trim();
          const role = String(cols[idxOf("role")] || "").trim();
          const department = String(cols[idxOf("department")] || "").trim();
          const faculty = String(cols[idxOf("faculty")] || "").trim();

          const academicYearIdx = idxOf("academicyear");
          const academicYear =
            academicYearIdx !== -1
              ? String(cols[academicYearIdx] || "").trim()
              : "";

          const rowErrors = [];
          if (!universityId) rowErrors.push("universityId");
          if (!name) rowErrors.push("name");
          if (!email) rowErrors.push("email");

          const normalizedRole = role.toLowerCase();
          if (normalizedRole !== "lecturer" && normalizedRole !== "student") {
            rowErrors.push("role (must be Lecturer or Student)");
          }
          if (!department) rowErrors.push("department");
          if (!faculty) rowErrors.push("faculty");
          if (normalizedRole === "student" && !academicYear) {
            rowErrors.push("academicYear (required for Student)");
          }

          const formattedRole = normalizedRole
            ? normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1)
            : "";

          rows.push({
            universityId,
            name,
            email,
            role: formattedRole,
            department,
            faculty,
            academicYear:
              normalizedRole === "student" ? academicYear : undefined,
            _rowIndex: i + 2,
            _errors: rowErrors,
          });

          if (rowErrors.length > 0) {
            errors.push(
              `Row ${i + 2}: missing/invalid — ${rowErrors.join(", ")}`,
            );
          }
        });

        resolve({ rows, errors });
      } catch (err) {
        reject(new Error("Failed to parse spreadsheet file: " + err.message));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Bulk-imports validated CSV rows into the user list.
 * Skips rows that have _errors.
 * @param {Array}    parsedRows — output of parseSpreadsheetToUsers
 * @param {Array}    users      — current user list
 * @param {Function} setUsers   — React state setter
 * @returns {number} count of users imported
 */
export async function importUsersFromCsv(parsedRows, users, setUsers) {
  const validRows = parsedRows.filter((r) => r._errors.length === 0);
  if (validRows.length === 0) return 0;

  let importCount = 0;
  const addedUsers = [];

  for (const r of validRows) {
    const newUser = {
      universityId: r.universityId,
      name: r.name,
      email: r.email,
      role: r.role.toLowerCase(),
      department: r.department,
      faculty: r.faculty,
      academicYear: r.role === "Student" ? r.academicYear : null,
    };

    try {
      const response = await fetch("http://localhost:8000/api/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const created = await response.json();
        const frontendUser = {
          id: created.universityId,
          universityId: created.universityId,
          name: created.name,
          email: created.email,
          role: created.role.charAt(0).toUpperCase() + created.role.slice(1),
          department: created.department,
          faculty: created.faculty,
          academicYear: created.academicYear || "",
        };
        addedUsers.push(frontendUser);
        importCount++;
      } else {
        const errData = await response.json().catch(() => ({}));
        console.error(
          `Failed to import user ${r.email}:`,
          errData.detail || response.statusText,
        );
      }
    } catch (err) {
      console.error(`Network error importing user ${r.email}:`, err);
    }
  }

  if (addedUsers.length > 0) {
    setUsers([...addedUsers, ...users]);
  }
  return importCount;
}
