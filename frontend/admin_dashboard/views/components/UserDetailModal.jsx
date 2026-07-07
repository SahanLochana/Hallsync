"use client";

/**
 * UserDetailModal — views/components/UserDetailModal.jsx
 *
 * Popup that appears when an admin clicks "View" on a user.
 * Shows user details, and has an Edit button.
 * Edit mode shows inline form fields.
 * Saving edits triggers a ConfirmModal.
 *
 * Props:
 *   isOpen       {boolean}  — show/hide
 *   user         {Object}   — the user object to display
 *   onClose      {Function}
 *   onSaveEdit   {Function} — (editedUser) => void
 */

import { useState, useEffect } from "react";
import { X, Pencil, Save, User, Mail, BookOpen, Layers, Award, ShieldAlert, CheckCircle2 } from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import { ROLE_FORM_OPTIONS } from "@/models/userModel";
import { validateUserForm } from "@/controllers/userController";

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

export default function UserDetailModal({ isOpen, user, onClose, onSaveEdit }) {
  const [isEditing, setIsEditing]             = useState(false);
  const [form, setForm]                       = useState({});
  const [errors, setErrors]                   = useState({});
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isSaving, setIsSaving]               = useState(false);
  const [modalError, setModalError]           = useState(null);

  // Sync form when user changes or modal opens
  useEffect(() => {
    if (isOpen && user) {
      setForm({ ...user });
      setIsEditing(false);
      setErrors({});
      setIsSaving(false);
      setModalError(null);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleSaveClick() {
    const e = validateUserForm(form);
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setShowSaveConfirm(true);
  }

  async function handleConfirmSave() {
    setShowSaveConfirm(false);
    setIsSaving(true);
    setModalError(null);
    try {
      await onSaveEdit({ ...form });
      setIsEditing(false);
    } catch (err) {
      setModalError(err.message || "Failed to update user.");
    } finally {
      setIsSaving(false);
    }
  }

  const inputCls =
    "border border-[#e2e8f0] rounded-xl px-3 py-2.5 text-sm text-[#0f172a] bg-white " +
    "focus:outline-none focus:ring-2 focus:ring-[#1e3b8a]/30 focus:border-[#1e3b8a] transition w-full";

  const isStudent = (isEditing ? form.role : user.role) === "Student";
  const idLabel = isStudent ? "University ID" : "Lecturer ID";
  const idPlaceholder = isStudent ? "e.g. SE/2021/001" : "e.g. LEC/001";

  // ── View mode row component ──────────────────────────────────────────────────
  const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-[#1e3b8a]">
        <Icon size={16} strokeWidth={2} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[#94a3b8] text-xs font-semibold uppercase tracking-wide">{label}</span>
        <span className="text-[#0f172a] text-sm font-medium">{value || "—"}</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="fixed z-50 inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 pointer-events-auto flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="bg-[#1e3b8a] px-6 py-4 flex items-center justify-between">
            <h2 className="text-white font-bold text-base">
              {isEditing ? "Edit User Details" : "User Details"}
            </h2>
            <button
              id="btn-user-detail-close"
              onClick={onClose}
              disabled={isSaving}
              className="text-white/70 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[60vh]">
            {modalError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <span className="text-red-600 text-xs font-medium">{modalError}</span>
              </div>
            )}
            {isEditing ? (
              /* ── EDIT FORM ─────────────────────────────────────────── */
              <div className="flex flex-col gap-4">
                {/* Role */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#334155] font-semibold text-xs uppercase tracking-wide">
                    Role
                  </label>
                  <select
                    id="edit-user-role"
                    disabled={isSaving}
                    className={`${inputCls} disabled:opacity-60 disabled:cursor-not-allowed`}
                    value={form.role || "Student"}
                    onChange={(e) => set("role", e.target.value)}
                  >
                    {ROLE_FORM_OPTIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* ID Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#334155] font-semibold text-xs uppercase tracking-wide">
                    {idLabel}
                  </label>
                  <input
                    id="edit-user-university-id"
                    disabled={isSaving}
                    className={`${inputCls} ${errors.universityId ? "border-red-400" : ""} disabled:opacity-60 disabled:cursor-not-allowed`}
                    placeholder={idPlaceholder}
                    value={form.universityId || ""}
                    onChange={(e) => set("universityId", e.target.value)}
                  />
                  {errors.universityId && <span className="text-red-500 text-xs">{errors.universityId}</span>}
                </div>

                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#334155] font-semibold text-xs uppercase tracking-wide">
                    Full Name
                  </label>
                  <input
                    id="edit-user-name"
                    disabled={isSaving}
                    className={`${inputCls} ${errors.name ? "border-red-400" : ""} disabled:opacity-60 disabled:cursor-not-allowed`}
                    placeholder="e.g. Sithumi Fernando"
                    value={form.name || ""}
                    onChange={(e) => set("name", e.target.value)}
                  />
                  {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#334155] font-semibold text-xs uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    id="edit-user-email"
                    type="email"
                    disabled={isSaving}
                    className={`${inputCls} ${errors.email ? "border-red-400" : ""} disabled:opacity-60 disabled:cursor-not-allowed`}
                    placeholder="e.g. sithumi@university.ac.lk"
                    value={form.email || ""}
                    onChange={(e) => set("email", e.target.value)}
                  />
                  {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
                </div>

                {/* Faculty */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#334155] font-semibold text-xs uppercase tracking-wide">
                    Faculty
                  </label>
                  <input
                    id="edit-user-faculty"
                    disabled={isSaving}
                    className={`${inputCls} ${errors.faculty ? "border-red-400" : ""} disabled:opacity-60 disabled:cursor-not-allowed`}
                    placeholder="e.g. Computing"
                    value={form.faculty || ""}
                    onChange={(e) => set("faculty", e.target.value)}
                  />
                  {errors.faculty && <span className="text-red-500 text-xs">{errors.faculty}</span>}
                </div>

                {/* Department */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#334155] font-semibold text-xs uppercase tracking-wide">
                    Department
                  </label>
                  <select
                    id="edit-user-department"
                    disabled={isSaving}
                    className={`${inputCls} ${errors.department ? "border-red-400" : ""} disabled:opacity-60 disabled:cursor-not-allowed`}
                    value={form.department || ""}
                    onChange={(e) => set("department", e.target.value)}
                  >
                    <option value="" disabled>Select Department</option>
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && <span className="text-red-500 text-xs">{errors.department}</span>}
                </div>

                {/* Academic Year (Student only) */}
                {isStudent && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[#334155] font-semibold text-xs uppercase tracking-wide">
                      Academic Year
                    </label>
                    <select
                      id="edit-user-academic-year"
                      disabled={isSaving}
                      className={`${inputCls} ${errors.academicYear ? "border-red-400" : ""} disabled:opacity-60 disabled:cursor-not-allowed`}
                      value={form.academicYear || ""}
                      onChange={(e) => set("academicYear", e.target.value)}
                    >
                      <option value="" disabled>Select Academic Year</option>
                      {BATCH_OPTIONS.map((batch) => (
                        <option key={batch} value={batch}>{batch}</option>
                      ))}
                    </select>
                    {errors.academicYear && <span className="text-red-500 text-xs">{errors.academicYear}</span>}
                  </div>
                )}
              </div>
            ) : (
              /* ── VIEW MODE ─────────────────────────────────────────── */
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#1e3b8a]/10 flex items-center justify-center text-[#1e3b8a] shrink-0">
                    <User size={24} strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#0f172a] font-bold text-base">{user.name}</span>
                    <span className="text-[#94a3b8] text-xs font-semibold uppercase tracking-wider">{user.role}</span>
                  </div>
                </div>

                <div className="h-px bg-[#e2e8f0] my-1" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailRow icon={Mail} label="Email" value={user.email} />
                  <DetailRow icon={BookOpen} label="Faculty" value={user.faculty} />
                  <DetailRow icon={Layers} label="Department" value={user.department} />
                  {isStudent && (
                    <DetailRow icon={Award} label="Academic Year" value={user.academicYear} />
                  )}
                  <DetailRow icon={ShieldAlert} label={idLabel} value={user.universityId} />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-end gap-3 shrink-0">
            {isEditing ? (
              <>
                <button
                  id="btn-edit-user-cancel"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl border border-[#e2e8f0] text-[#334155] font-semibold text-sm hover:bg-[#f8fafc] transition-colors bg-white disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  id="btn-edit-user-save"
                  onClick={handleSaveClick}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#1e3b8a] text-white font-semibold text-sm hover:bg-[#162d6b] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <>
                <button
                  id="btn-detail-close"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-[#e2e8f0] text-[#334155] font-semibold text-sm hover:bg-[#f8fafc] transition-colors bg-white"
                >
                  Close
                </button>
                <button
                  id="btn-user-edit-trigger"
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#1e3b8a] text-white font-semibold text-sm hover:bg-[#162d6b] transition-colors flex items-center gap-1.5"
                >
                  <Pencil size={14} />
                  Edit Details
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Save confirmation */}
      <ConfirmModal
        isOpen={showSaveConfirm}
        title="Save Changes?"
        message={`Are you sure you want to update the details for ${user.name}?`}
        confirmLabel="Save"
        confirmStyle="primary"
        onCancel={() => setShowSaveConfirm(false)}
        onConfirm={handleConfirmSave}
      />
    </>
  );
}
