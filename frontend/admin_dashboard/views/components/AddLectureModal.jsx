"use client";

/**
 * AddLectureModal — views/components/AddLectureModal.jsx
 *
 * Modal form for creating a new lecture entry.
 * Opened when an admin clicks an empty grid cell while in Edit Mode.
 *
 * Props:
 *   isOpen           {boolean}  — controls visibility
 *   defaultDay       {string}   — pre-filled day from clicked cell
 *   defaultStartHour {number}   — pre-filled start time from clicked cell
 *   onClose          {Function} — dismiss without saving
 *   onConfirm        {Function} — (newLecture: Object) => void
 */

import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { DAYS, HALF_HOURS, formatHour } from "@/models/timetableViewModel";

const EMPTY_FORM = {
  lectureName:  "",
  lecturerName: "",
  day:          "Monday",
  startHour:    8,
  endHour:      9,
  location:     "",
};

// ── Field wrapper ─────────────────────────────────────────────────────────────
// IMPORTANT: defined at module level (outside AddLectureModal) so React never
// treats it as a new component type on re-render, which would unmount the input
// and lose focus after every keystroke.
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

// ── Modal ─────────────────────────────────────────────────────────────────────
export default function AddLectureModal({
  isOpen,
  defaultDay,
  defaultStartHour,
  onClose,
  onConfirm,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Reset & pre-fill whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      const start = defaultStartHour ?? 8;
      const end = Math.min(start + 1, 17);
      setForm({
        ...EMPTY_FORM,
        day:       defaultDay ?? "Monday",
        startHour: start,
        endHour:   end,
      });
      setErrors({});
    }
  }, [isOpen, defaultDay, defaultStartHour]);

  if (!isOpen) return null;

  function set(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "startHour" && next.endHour <= value) {
        next.endHour = value + 0.5 <= 17 ? value + 0.5 : 17;
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.lectureName.trim())  e.lectureName  = "Required";
    if (!form.lecturerName.trim()) e.lecturerName = "Required";
    if (!form.location.trim())     e.location     = "Required";
    if (form.endHour <= form.startHour) e.endHour = "Must be after start time";
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onConfirm({ ...form });
  }

  const inputCls =
    "border rounded-xl px-3 py-2.5 text-sm text-[#0f172a] bg-white " +
    "focus:outline-none focus:ring-2 focus:ring-[#1e3b8a]/30 focus:border-[#1e3b8a] transition";

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
              <Plus size={18} strokeWidth={2.5} />
              Add New Lecture
            </h2>
            <button
              id="btn-add-lecture-close"
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">

            {/* Lecture Name */}
            <Field label="Lecture Name" error={errors.lectureName}>
              <input
                id="add-lecture-name"
                className={`${inputCls} ${errors.lectureName ? "border-red-400" : "border-[#e2e8f0]"}`}
                placeholder="e.g. Software Engineering"
                value={form.lectureName}
                onChange={(e) => set("lectureName", e.target.value)}
              />
            </Field>

            {/* Lecturer Name */}
            <Field label="Lecturer Name" error={errors.lecturerName}>
              <input
                id="add-lecturer-name"
                className={`${inputCls} ${errors.lecturerName ? "border-red-400" : "border-[#e2e8f0]"}`}
                placeholder="e.g. Dr. Perera"
                value={form.lecturerName}
                onChange={(e) => set("lecturerName", e.target.value)}
              />
            </Field>

            {/* Day */}
            <Field label="Day">
              <select
                id="add-day"
                className={`${inputCls} border-[#e2e8f0]`}
                value={form.day}
                onChange={(e) => set("day", e.target.value)}
              >
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>

            {/* Time row */}
            <div className="flex gap-3">
              <Field label="Start Time" error={errors.startHour}>
                <select
                  id="add-start-hour"
                  className={`${inputCls} border-[#e2e8f0] flex-1`}
                  value={form.startHour}
                  onChange={(e) => set("startHour", Number(e.target.value))}
                >
                  {HALF_HOURS.slice(0, -1).map((h) => (
                    <option key={h} value={h}>{formatHour(h)}</option>
                  ))}
                </select>
              </Field>
              <Field label="End Time" error={errors.endHour}>
                <select
                  id="add-end-hour"
                  className={`${inputCls} ${errors.endHour ? "border-red-400" : "border-[#e2e8f0]"} flex-1`}
                  value={form.endHour}
                  onChange={(e) => set("endHour", Number(e.target.value))}
                >
                  {HALF_HOURS.filter((h) => h > form.startHour).map((h) => (
                    <option key={h} value={h}>{formatHour(h)}</option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Location */}
            <Field label="Location" error={errors.location}>
              <input
                id="add-location"
                className={`${inputCls} ${errors.location ? "border-red-400" : "border-[#e2e8f0]"}`}
                placeholder="e.g. Hall A - Room 101"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </Field>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3">
            <button
              id="btn-add-cancel"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#e2e8f0] text-[#334155] font-semibold text-sm hover:bg-[#f8fafc] transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-add-confirm"
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl bg-[#1e3b8a] text-white font-semibold text-sm
                         flex items-center gap-1.5 hover:bg-[#162d6b] active:scale-[0.98]
                         transition-all shadow-[0_4px_12px_rgba(30,59,138,0.25)]"
            >
              <Plus size={15} strokeWidth={2.5} />
              Add Lecture
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
