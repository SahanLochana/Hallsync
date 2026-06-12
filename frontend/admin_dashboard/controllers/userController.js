/**
 * User Controller — controllers/userController.js
 * All business logic for the user management pages.
 * The View (UsersPage.jsx) calls these functions.
 * Replace TODO comments with real API calls when backend is ready.
 */

import { SAMPLE_USERS } from "../models/userModel";

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Generates a simple unique ID for new users (replace with backend-assigned ID). */
function generateId() {
  return "u" + Date.now().toString(36);
}

// ── Data Fetching ──────────────────────────────────────────────────────────────

/**
 * Fetches the list of users.
 * TODO: Replace with real API call — getUsers()
 * @param {Function} setUsers     — React state setter
 * @param {Function} setIsLoading — React state setter
 * @param {Function} setError     — React state setter
 */
export async function fetchUsers(setUsers, setIsLoading, setError) {
  setIsLoading(true);
  setError(null);
  try {
    const response = await fetch("http://localhost:8000/api/users/");
    const users = await response.json();
    setUsers(users);
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
    const matchRole = u.role === role;
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
    errors.universityId = form.role === "Lecturer" ? "Lecturer ID is required." : "University ID is required.";
  }
  if (!form.name?.trim())         errors.name         = "Full name is required.";
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
  if (!form.department?.trim())   errors.department   = "Department is required.";
  if (!form.faculty?.trim())      errors.faculty      = "Faculty is required.";
  if (form.role === "Student" && !form.academicYear?.trim()) {
    errors.academicYear = "Academic Year is required.";
  }
  return errors;
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Adds a single new user to the list.
 * TODO: Replace with real API call — createUser(form)
 * @param {Array}    users    — current user list from state
 * @param {Object}   form     — { universityId, name, email, role, department, faculty, academicYear, isActive }
 * @param {Function} setUsers — React state setter
 */
export async function addUser(users, form, setUsers) {
  // TODO: const created = await userService.create(form);
  const newUser = {
    ...form,
    id: generateId(),
    createdAt: new Date().toLocaleDateString("en-CA").replace(/-/g, "."),
  };
  // Clean academicYear if role is Lecturer
  if (newUser.role === "Lecturer") {
    delete newUser.academicYear;
  }
  setUsers([newUser, ...users]);
}

/**
 * Updates an existing user in the list.
 * TODO: Replace with real API call — updateUser(id, form)
 * @param {Array}    users       — current user list from state
 * @param {Object}   updatedUser — full user object with updated fields
 * @param {Function} setUsers    — React state setter
 */
export async function editUser(users, updatedUser, setUsers) {
  // TODO: await userService.update(updatedUser.id, updatedUser);
  const cleanUser = { ...updatedUser };
  if (cleanUser.role === "Lecturer") {
    cleanUser.academicYear = undefined;
  }
  setUsers(users.map((u) => (u.id === cleanUser.id ? { ...u, ...cleanUser } : u)));
}

// ── CSV Import ────────────────────────────────────────────────────────────────

/**
 * Parses a CSV string into an array of user-like objects.
 * Expected header row: universityId,name,email,role,department,faculty,academicYear,isActive
 * @param {string} csvText — raw CSV content
 * @returns {{ rows: Array, errors: string[] }}
 */
export function parseCsvToUsers(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return { rows: [], errors: ["CSV file is empty or has no data rows."] };

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, ""));
  
  // Required columns for all users
  const required = ["universityid", "name", "email", "role", "department", "faculty"];
  const missingHeaders = required.filter((r) => !header.includes(r));
  if (missingHeaders.length > 0) {
    return {
      rows: [],
      errors: [`Missing required columns: ${missingHeaders.join(", ")}.`],
    };
  }

  const idxOf = (col) => header.indexOf(col);
  const rows = [];
  const errors = [];

  lines.slice(1).forEach((line, i) => {
    if (!line.trim()) return; // skip blank lines
    const cols = line.split(",").map((c) => c.trim());
    const universityId = cols[idxOf("universityid")] || "";
    const name         = cols[idxOf("name")]         || "";
    const email        = cols[idxOf("email")]        || "";
    const role         = cols[idxOf("role")]         || "";
    const department   = cols[idxOf("department")]   || "";
    const faculty      = cols[idxOf("faculty")]      || "";
    
    const academicYearIdx = idxOf("academicyear");
    const academicYear = academicYearIdx !== -1 ? cols[academicYearIdx] || "" : "";
    
    const isActiveRaw  = header.includes("isactive") ? cols[idxOf("isactive")] : "true";
    const isActive     = isActiveRaw.toLowerCase() !== "false";

    const rowErrors = [];
    if (!universityId) rowErrors.push("universityId");
    if (!name)         rowErrors.push("name");
    if (!email)        rowErrors.push("email");
    if (!["Lecturer", "Student"].includes(role)) {
      rowErrors.push("role (must be Lecturer or Student)");
    }
    if (!department)   rowErrors.push("department");
    if (!faculty)      rowErrors.push("faculty");
    if (role === "Student" && !academicYear) {
      rowErrors.push("academicYear (required for Student)");
    }

    rows.push({
      universityId,
      name,
      email,
      role,
      department,
      faculty,
      academicYear: role === "Student" ? academicYear : undefined,
      isActive,
      _rowIndex: i + 2, // 1-based data row
      _errors: rowErrors,
    });

    if (rowErrors.length > 0) {
      errors.push(`Row ${i + 2}: missing/invalid — ${rowErrors.join(", ")}`);
    }
  });

  return { rows, errors };
}

/**
 * Bulk-imports validated CSV rows into the user list.
 * Skips rows that have _errors.
 * TODO: Replace with real API call — bulkCreateUsers(validRows)
 * @param {Array}    parsedRows — output of parseCsvToUsers
 * @param {Array}    users      — current user list
 * @param {Function} setUsers   — React state setter
 * @returns {number} count of users imported
 */
export async function importUsersFromCsv(parsedRows, users, setUsers) {
  const validRows = parsedRows.filter((r) => r._errors.length === 0);
  if (validRows.length === 0) return 0;

  const today = new Date().toLocaleDateString("en-CA").replace(/-/g, ".");
  const newUsers = validRows.map((r) => ({
    id: generateId(),
    universityId: r.universityId,
    name: r.name,
    email: r.email,
    role: r.role,
    department: r.department,
    faculty: r.faculty,
    academicYear: r.role === "Student" ? r.academicYear : undefined,
    isActive: r.isActive,
    createdAt: today,
  }));

  // TODO: await userService.bulkCreate(newUsers);
  setUsers([...newUsers, ...users]);
  return newUsers.length;
}
