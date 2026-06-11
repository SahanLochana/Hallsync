/**
 * User Model — models/userModel.js
 * Defines the shape of user state, role options,
 * and sample/mock data for frontend development.
 * Replace SAMPLE_USERS with real API data when backend is ready.
 */

/**
 * Shape of a single user entry:
 * {
 *   id:           string  — internal unique ID (e.g. "u001")
 *   universityId: string  — e.g. "SE/2021/001" (student uni ID) or "LEC/001" (lecturer ID)
 *   name:         string  — full name
 *   email:        string
 *   role:         "Lecturer" | "Student"
 *   department:   string  — e.g. "Software Engineering"
 *   faculty:      string  — e.g. "Computing"
 *   academicYear: string  — e.g. "3rd Year" (only for Student)
 *   isActive:     boolean
 *   createdAt:    string  — formatted date string
 * }
 */

/** Initial filter/search state */
export const initialUserFilterState = {
  search: "",
  role: "All",
};

/** Available role filter options */
export const ROLE_OPTIONS = ["All", "Lecturer", "Student"];

/** Role options for form selects (no "All") */
export const ROLE_FORM_OPTIONS = ["Lecturer", "Student"];

/** Sample user data — replace with API response */
export const SAMPLE_USERS = [
  {
    id: "u001",
    universityId: "LEC/001",
    name: "Dr. Ravi Jayasinghe",
    email: "ravi.jayasinghe@university.ac.lk",
    role: "Lecturer",
    department: "Software Engineering",
    faculty: "Computing",
    isActive: true,
    createdAt: "2025.09.01",
  },
  {
    id: "u002",
    universityId: "SE/2021/002",
    name: "Sithumi Fernando",
    email: "sithumi.fernando@university.ac.lk",
    role: "Student",
    department: "Software Engineering",
    faculty: "Computing",
    academicYear: "2nd Year",
    isActive: true,
    createdAt: "2026.01.12",
  },
  {
    id: "u003",
    universityId: "SE/2021/003",
    name: "Kasun Bandara",
    email: "kasun.bandara@university.ac.lk",
    role: "Student",
    department: "Software Engineering",
    faculty: "Computing",
    academicYear: "2nd Year",
    isActive: false,
    createdAt: "2026.01.12",
  },
  {
    id: "u004",
    universityId: "CS/2022/001",
    name: "Nimali Dissanayake",
    email: "nimali.dissanayake@university.ac.lk",
    role: "Student",
    department: "Computer Science",
    faculty: "Computing",
    academicYear: "1st Year",
    isActive: true,
    createdAt: "2026.02.03",
  },
  {
    id: "u005",
    universityId: "LEC/002",
    name: "Prof. Sunanda Wijeratne",
    email: "sunanda.wijeratne@university.ac.lk",
    role: "Lecturer",
    department: "Computer Science",
    faculty: "Computing",
    isActive: true,
    createdAt: "2025.08.15",
  },
  {
    id: "u006",
    universityId: "IT/2023/001",
    name: "Thilina Rajapaksa",
    email: "thilina.rajapaksa@university.ac.lk",
    role: "Student",
    department: "Information Technology",
    faculty: "Computing",
    academicYear: "1st Year",
    isActive: false,
    createdAt: "2026.03.20",
  },
  {
    id: "u007",
    universityId: "SE/2020/015",
    name: "Chamari Silva",
    email: "chamari.silva@university.ac.lk",
    role: "Student",
    department: "Software Engineering",
    faculty: "Computing",
    academicYear: "3rd Year",
    isActive: true,
    createdAt: "2025.11.05",
  },
];

