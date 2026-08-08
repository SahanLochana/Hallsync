"use client";

/**
 * AddUserModal — views/components/AddUserModal.jsx
 *
 * Modal form for adding a single new user.
 *
 * Props:
 *   isOpen     {boolean}  — controls visibility
 *   onClose    {Function} — dismiss without saving
 *   onConfirm  {Function} — (newUserForm: Object) => void
 */

import { useState, useEffect } from "react";
import { X, UserPlus, BookOpen, Check } from "lucide-react";
import { ROLE_FORM_OPTIONS } from "@/models/userModel";
import { validateUserForm, fetchModules } from "@/controllers/userController";

const EMPTY_FORM = {
  universityId: "",
  name: "",
  email: "",
  role: "Student",
  department: "",
  faculty: "",
  academicYear: "",
  modules: [],
};

const DEPARTMENT_OPTIONS = [
  "Computing & Information Systems (CIS)",
  "Software Engineering (SE)",
  "Data Science (DS)",
];

const BATCH_OPTIONS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
];

// ── Field wrapper ──────────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[#334155] font-semibold text-xs uppercase tracking-wide">
        {label}
      </label>
      {children}
      {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────
export default function AddUserModal({ isOpen, onClose, onConfirm }) {
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [errors, setErrors]             = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError]     = useState(null);
  const [availableModules, setAvailableModules] = useState([]);
  const [isLoadingModules, setIsLoadingModules] = useState(false);

  // Fetch modules & reset form whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_FORM);
      setErrors({});
      setIsSubmitting(false);
      setModalError(null);

      setIsLoadingModules(true);
      fetchModules().then((mods) => {
        setAvailableModules(mods);
        setIsLoadingModules(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleAddModule(moduleId) {
    if (!moduleId) return;
    if (!form.modules.includes(moduleId)) {
      set("modules", [...form.modules, moduleId]);
    }
  }

  function handleRemoveModule(moduleId) {
    set(
      "modules",
      form.modules.filter((m) => m !== moduleId)
    );
  }

  async function handleSubmit() {
    const e = validateUserForm(form);
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setIsSubmitting(true);
    setModalError(null);
    try {
      await onConfirm({ ...form });
    } catch (err) {
      setModalError(err.message || "Failed to add user.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputCls =
    "border rounded-xl px-3 py-2.5 text-sm text-[#0f172a] bg-white " +
    "focus:outline-none focus:ring-2 focus:ring-[#1e3b8a]/30 focus:border-[#1e3b8a] transition w-full";

  const isStudent = form.role === "Student";
  const isLecturer = form.role === "Lecturer";
  const idLabel = isStudent ? "University ID" : "Lecturer ID";
  const idPlaceholder = isStudent ? "e.g. SE/2021/001" : "e.g. LEC/001";

  // Unselected modules list
  const unselectedModules = availableModules.filter(
    (m) => !form.modules.includes(m.module_id)
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 pointer-events-auto flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#1e3b8a] px-6 py-4 flex items-center justify-between">
            <h2 className="text-white font-bold text-base flex items-center gap-2">
              <UserPlus size={18} strokeWidth={2.5} />
              Add New User
            </h2>
            <button
              id="btn-add-user-close"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-white/70 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
            {modalError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <span className="text-red-600 text-xs font-medium">
                  {modalError}
                </span>
              </div>
            )}

            {/* Role */}
            <Field label="Role" error={errors.role}>
              <select
                id="add-user-role"
                disabled={isSubmitting}
                className={`${inputCls} ${errors.role ? "border-red-400" : "border-[#e2e8f0]"} disabled:opacity-60 disabled:cursor-not-allowed`}
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
              >
                {ROLE_FORM_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>

            {/* ID (University ID or Lecturer ID) */}
            <Field label={idLabel} error={errors.universityId}>
              <input
                id="add-user-university-id"
                disabled={isSubmitting}
                className={`${inputCls} ${errors.universityId ? "border-red-400" : "border-[#e2e8f0]"} disabled:opacity-60 disabled:cursor-not-allowed`}
                placeholder={idPlaceholder}
                value={form.universityId}
                onChange={(e) => set("universityId", e.target.value)}
              />
            </Field>

            {/* Full Name */}
            <Field label="Full Name" error={errors.name}>
              <input
                id="add-user-name"
                disabled={isSubmitting}
                className={`${inputCls} ${errors.name ? "border-red-400" : "border-[#e2e8f0]"} disabled:opacity-60 disabled:cursor-not-allowed`}
                placeholder="e.g. Amal Perera"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>

            {/* Email */}
            <Field label="Email" error={errors.email}>
              <input
                id="add-user-email"
                type="email"
                disabled={isSubmitting}
                className={`${inputCls} ${errors.email ? "border-red-400" : "border-[#e2e8f0]"} disabled:opacity-60 disabled:cursor-not-allowed`}
                placeholder="e.g. amal@university.ac.lk"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </Field>

            {/* Faculty */}
            <Field label="Faculty" error={errors.faculty}>
              <input
                id="add-user-faculty"
                disabled={isSubmitting}
                className={`${inputCls} ${errors.faculty ? "border-red-400" : "border-[#e2e8f0]"} disabled:opacity-60 disabled:cursor-not-allowed`}
                placeholder="e.g. Computing"
                value={form.faculty}
                onChange={(e) => set("faculty", e.target.value)}
              />
            </Field>

            {/* Department */}
            <Field label="Department" error={errors.department}>
              <select
                id="add-user-department"
                disabled={isSubmitting}
                className={`${inputCls} ${errors.department ? "border-red-400" : "border-[#e2e8f0]"} disabled:opacity-60 disabled:cursor-not-allowed`}
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
              >
                <option value="" disabled>
                  Select Department
                </option>
                {DEPARTMENT_OPTIONS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </Field>

            {/* Academic Year (Student only) */}
            {isStudent && (
              <Field label="Academic Year" error={errors.academicYear}>
                <select
                  id="add-user-academic-year"
                  disabled={isSubmitting}
                  className={`${inputCls} ${errors.academicYear ? "border-red-400" : "border-[#e2e8f0]"} disabled:opacity-60 disabled:cursor-not-allowed`}
                  value={form.academicYear}
                  onChange={(e) => set("academicYear", e.target.value)}
                >
                  <option value="" disabled>
                    Select Academic Year
                  </option>
                  {BATCH_OPTIONS.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            {/* Assigned Modules (Lecturer only) */}
            {isLecturer && (
              <Field label="Assigned Modules" error={errors.modules}>
                <div className="flex flex-col gap-2">
                  {/* Selected module chips */}
                  {form.modules.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl">
                      {form.modules.map((modId) => {
                        const modObj = availableModules.find(
                          (m) => m.module_id === modId
                        );
                        return (
                          <span
                            key={modId}
                            className="inline-flex items-center gap-1.5 bg-[#1e3b8a] text-white text-xs px-2.5 py-1 rounded-lg shadow-sm"
                          >
                            <BookOpen size={12} />
                            <span>
                              {modId} {modObj ? `(${modObj.name})` : ""}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveModule(modId)}
                              className="hover:text-red-300 transition-colors ml-0.5"
                            >
                              <X size={13} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Dropdown to pick and assign module */}
                  <select
                    id="add-user-module-picker"
                    disabled={isSubmitting || isLoadingModules}
                    className={`${inputCls} border-[#e2e8f0] disabled:opacity-60 disabled:cursor-not-allowed`}
                    value=""
                    onChange={(e) => handleAddModule(e.target.value)}
                  >
                    <option value="" disabled>
                      {isLoadingModules
                        ? "Loading modules..."
                        : unselectedModules.length === 0
                        ? "No more modules available"
                        : "Select module to assign..."}
                    </option>
                    {unselectedModules.map((m) => (
                      <option key={m.module_id} value={m.module_id}>
                        {m.module_id} — {m.name} ({m.semester})
                      </option>
                    ))}
                  </select>
                </div>
              </Field>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3">
            <button
              id="btn-add-user-cancel"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-[#e2e8f0] text-[#334155] font-semibold text-sm hover:bg-[#f8fafc] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              id="btn-add-user-confirm"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#1e3b8a] text-white font-semibold text-sm
                         flex items-center gap-1.5 hover:bg-[#162d6b] active:scale-[0.98]
                         transition-all shadow-[0_4px_12px_rgba(30,59,138,0.25)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus size={15} strokeWidth={2.5} />
              )}
              {isSubmitting ? "Adding..." : "Add User"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
