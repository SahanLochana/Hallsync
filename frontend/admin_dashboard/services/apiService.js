/**
 * Centralized API Service — services/apiService.js
 * Single source of truth for all backend API endpoints and domain methods.
 */

import apiClient from "./apiClient";

export const apiService = {
  /** Admin Authentication endpoints */
  auth: {
    login: (admin_id, password) =>
      apiClient.post("/admin/login", { admin_id, password }),

    verifyToken: (token) =>
      apiClient.get("/admin/verify-token", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
  },

  /** User Management endpoints */
  users: {
    getAll: () => apiClient.get("/users/"),

    create: (userData) => apiClient.post("/users/", userData),

    update: (id, userData) => apiClient.put(`/users/${encodeURIComponent(id)}`, userData),

    delete: (id) => apiClient.delete(`/users/${encodeURIComponent(id)}`),

    bulkImport: (usersPayload) => apiClient.post("/users/bulk", usersPayload),
  },

  /** Hall Management endpoints */
  halls: {
    getAll: () => apiClient.get("/halls/"),

    create: (hallData) => apiClient.post("/halls/", hallData),

    update: (id, hallData) => apiClient.put(`/halls/${encodeURIComponent(id)}`, hallData),

    delete: (id) => apiClient.delete(`/halls/${encodeURIComponent(id)}`),
  },

  /** Department endpoints */
  departments: {
    getAll: () => apiClient.get("/departments/"),
  },

  /** Academic Modules endpoints */
  modules: {
    getAll: () => apiClient.get("/modules"),

    addItem: (semester, itemPayload) =>
      apiClient.post(`/modules/${encodeURIComponent(semester)}/items`, itemPayload),

    createSemester: (semesterData) =>
      apiClient.post("/modules/", semesterData),
  },

  /** Timetable Management endpoints */
  timetables: {
    getAll: () => apiClient.get("/timetables/"),

    getById: (id) => apiClient.get(`/timetables/${encodeURIComponent(id)}`),

    create: (timetableData) => apiClient.post("/timetables/", timetableData),

    update: (id, timetableData) =>
      apiClient.put(`/timetables/${encodeURIComponent(id)}`, timetableData),

    delete: (id) => apiClient.delete(`/timetables/${encodeURIComponent(id)}`),
  },
};

export default apiService;
