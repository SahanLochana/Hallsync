"use client";

/**
 * AddModuleModal — views/components/AddModuleModal.jsx
 *
 * Modal form for adding a new academic module.
 *
 * Props:
 *   isOpen     {boolean}  — controls visibility
 *   onClose    {Function} — dismiss without saving
 *   onConfirm  {Function} — (form: Object) => void
 */

import { useState, useEffect } from "react";
import { X, BookOpen, AlertTriangle } from "lucide-react";
import { SEMESTER_OPTIONS } from "@/models/homeModel";

const EMPTY_FORM = {
  semester: "Semester 1",
  moduleId: "",
  name: "",
};

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

export default function AddModuleModal({ isOpen, onClose, onConfirm }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_FORM);
      setErrors({});
      setIsSubmitting(false);
      setModalError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setModalError(null);
  }

  function validate() {
    const errs = {};
    if (!form.semester) errs.semester = "Semester is required.";
    if (!form.moduleId?.trim()) errs.moduleId = "Module ID is required.";
    if (!form.name?.trim()) errs.name = "Module name is required.";
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    setModalError(null);
    try {
      await onConfirm({ ...form });
    } catch (err) {
      setModalError(err.message || "Failed to add module.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputCls =
    "border rounded-xl px-3 py-2.5 text-sm text-[#0f172a] bg-white " +
    "focus:outline-none focus:ring-2 focus:ring-[#1e3b8a]/30 focus:border-[#1e3b8a] transition w-full";

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
              <BookOpen size={18} strokeWidth={2.5} />
              Add New Module
            </h2>
            <button
              id="btn-add-module-close"
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
            {modalError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Semester */}
            <Field label="Semester" error={errors.semester}>
              <select
                id="add-module-semester"
                className={`${inputCls} ${errors.semester ? "border-red-400" : "border-[#e2e8f0]"}`}
                value={form.semester}
                onChange={(e) => set("semester", e.target.value)}
                disabled={isSubmitting}
              >
                {SEMESTER_OPTIONS.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </Field>

            {/* Module ID */}
            <Field label="Module ID" error={errors.moduleId}>
              <input
                id="add-module-id"
                className={`${inputCls} ${errors.moduleId ? "border-red-400" : "border-[#e2e8f0]"}`}
                placeholder="e.g. SENG 31232"
                value={form.moduleId}
                onChange={(e) => set("moduleId", e.target.value)}
                disabled={isSubmitting}
              />
            </Field>

            {/* Module Name */}
            <Field label="Module Name" error={errors.name}>
              <input
                id="add-module-name"
                className={`${inputCls} ${errors.name ? "border-red-400" : "border-[#e2e8f0]"}`}
                placeholder="e.g. Software Architecture & Design"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                disabled={isSubmitting}
              />
            </Field>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3 border-t border-[#f1f5f9]">
            <button
              id="btn-add-module-cancel"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-[#e2e8f0] text-[#334155] font-semibold text-sm hover:bg-[#f8fafc] transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              id="btn-add-module-confirm"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#1e3b8a] text-white font-semibold text-sm
                         flex items-center gap-1.5 hover:bg-[#162d6b] active:scale-[0.98]
                         transition-all shadow-[0_4px_12px_rgba(30,59,138,0.25)] disabled:opacity-60"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <BookOpen size={15} strokeWidth={2.5} />
              )}
              {isSubmitting ? "Adding..." : "Add Module"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
