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
import { X, UserPlus } from "lucide-react";
import { ROLE_FORM_OPTIONS } from "@/models/userModel";
import { validateUserForm } from "@/controllers/userController";

const EMPTY_FORM = {
  universityId: "",
  name: "",
  email: "",
  role: "Student",
  department: "",
  faculty: "",
  academicYear: "",

};

// ── Field wrapper — defined at module level to avoid React re-mount on rerender ─
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
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Reset whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleSubmit() {
    const e = validateUserForm(form);
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onConfirm({ ...form });
  }

  const inputCls =
    "border rounded-xl px-3 py-2.5 text-sm text-[#0f172a] bg-white " +
    "focus:outline-none focus:ring-2 focus:ring-[#1e3b8a]/30 focus:border-[#1e3b8a] transition w-full";

  const isStudent = form.role === "Student";
  const idLabel = isStudent ? "University ID" : "Lecturer ID";
  const idPlaceholder = isStudent ? "e.g. SE/2021/001" : "e.g. LEC/001";

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
              className="text-white/70 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">

            {/* Role */}
            <Field label="Role" error={errors.role}>
              <select
                id="add-user-role"
                className={`${inputCls} ${errors.role ? "border-red-400" : "border-[#e2e8f0]"}`}
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
              >
                {ROLE_FORM_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </Field>

            {/* ID (University ID or Lecturer ID) */}
            <Field label={idLabel} error={errors.universityId}>
              <input
                id="add-user-university-id"
                className={`${inputCls} ${errors.universityId ? "border-red-400" : "border-[#e2e8f0]"}`}
                placeholder={idPlaceholder}
                value={form.universityId}
                onChange={(e) => set("universityId", e.target.value)}
              />
            </Field>

            {/* Full Name */}
            <Field label="Full Name" error={errors.name}>
              <input
                id="add-user-name"
                className={`${inputCls} ${errors.name ? "border-red-400" : "border-[#e2e8f0]"}`}
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
                className={`${inputCls} ${errors.email ? "border-red-400" : "border-[#e2e8f0]"}`}
                placeholder="e.g. amal@university.ac.lk"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </Field>

            {/* Faculty */}
            <Field label="Faculty" error={errors.faculty}>
              <input
                id="add-user-faculty"
                className={`${inputCls} ${errors.faculty ? "border-red-400" : "border-[#e2e8f0]"}`}
                placeholder="e.g. Computing"
                value={form.faculty}
                onChange={(e) => set("faculty", e.target.value)}
              />
            </Field>

            {/* Department */}
            <Field label="Department" error={errors.department}>
              <input
                id="add-user-department"
                className={`${inputCls} ${errors.department ? "border-red-400" : "border-[#e2e8f0]"}`}
                placeholder="e.g. Software Engineering"
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
              />
            </Field>

            {/* Academic Year (Student only) */}
            {isStudent && (
              <Field label="Academic Year" error={errors.academicYear}>
                <input
                  id="add-user-academic-year"
                  className={`${inputCls} ${errors.academicYear ? "border-red-400" : "border-[#e2e8f0]"}`}
                  placeholder="e.g. 2nd Year"
                  value={form.academicYear}
                  onChange={(e) => set("academicYear", e.target.value)}
                />
              </Field>
            )}


          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3">
            <button
              id="btn-add-user-cancel"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#e2e8f0] text-[#334155] font-semibold text-sm hover:bg-[#f8fafc] transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-add-user-confirm"
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl bg-[#1e3b8a] text-white font-semibold text-sm
                         flex items-center gap-1.5 hover:bg-[#162d6b] active:scale-[0.98]
                         transition-all shadow-[0_4px_12px_rgba(30,59,138,0.25)]"
            >
              <UserPlus size={15} strokeWidth={2.5} />
              Add User
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
