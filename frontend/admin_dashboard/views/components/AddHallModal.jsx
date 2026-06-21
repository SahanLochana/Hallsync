"use client";

/**
 * AddHallModal — views/components/AddHallModal.jsx
 *
 * Modal form for adding a new lecture hall.
 *
 * Props:
 *   isOpen     {boolean}  — controls visibility
 *   onClose    {Function} — dismiss without saving
 *   onConfirm  {Function} — (form: Object) => void  (called with valid form data)
 */

import { useState, useEffect } from "react";
import { X, DoorOpen, AlertTriangle } from "lucide-react";
import { validateHallForm, validateLocationForm } from "@/controllers/hallController";

const EMPTY_FORM = {
  hallId: "",
  name: "",
  capacity: "",
  availability: true,
  latitude: "",
  longitude: "",
};

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

// ── Section heading ────────────────────────────────────────────────────────────
function SectionHeading({ children }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-[#0f172a] font-bold text-xs uppercase tracking-widest">
        {children}
      </span>
      <div className="flex-1 h-px bg-[#e2e8f0]" />
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────
export default function AddHallModal({ isOpen, onClose, onConfirm }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Reset on open
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

  async function handleSubmit() {
    const formErrors  = validateHallForm(form);
    const locErrors   = validateLocationForm(form);
    const allErrors   = { ...formErrors, ...locErrors };
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }
    
    setIsSubmitting(true);
    setModalError(null);
    try {
      await onConfirm({ ...form });
    } catch (err) {
      setModalError(err.message || "Failed to add hall.");
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
              <DoorOpen size={18} strokeWidth={2.5} />
              Add New Hall
            </h2>
            <button
              id="btn-add-hall-close"
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

            {/* ── Hall Information ── */}
            <SectionHeading>Hall Information</SectionHeading>

            {/* Hall ID */}
            <Field label="Hall ID" error={errors.hallId}>
              <input
                id="add-hall-id"
                className={`${inputCls} ${errors.hallId ? "border-red-400" : "border-[#e2e8f0]"}`}
                placeholder="e.g. LH001"
                value={form.hallId}
                onChange={(e) => set("hallId", e.target.value)}
                disabled={isSubmitting}
              />
            </Field>

            {/* Hall Name */}
            <Field label="Hall Name" error={errors.name}>
              <input
                id="add-hall-name"
                className={`${inputCls} ${errors.name ? "border-red-400" : "border-[#e2e8f0]"}`}
                placeholder="e.g. New Lecture Hall"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                disabled={isSubmitting}
              />
            </Field>

            {/* Capacity */}
            <Field label="Capacity" error={errors.capacity}>
              <input
                id="add-hall-capacity"
                type="number"
                min="1"
                className={`${inputCls} ${errors.capacity ? "border-red-400" : "border-[#e2e8f0]"}`}
                placeholder="e.g. 200"
                value={form.capacity}
                onChange={(e) => set("capacity", e.target.value)}
                disabled={isSubmitting}
              />
            </Field>

            {/* Availability */}
            <Field label="Availability" error={errors.availability}>
              <select
                id="add-hall-availability"
                className={`${inputCls} ${errors.availability ? "border-red-400" : "border-[#e2e8f0]"}`}
                value={form.availability ? "true" : "false"}
                onChange={(e) => set("availability", e.target.value === "true")}
                disabled={isSubmitting}
              >
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
            </Field>

            {/* ── Location Information (optional) ── */}
            <SectionHeading>Location Information <span className="normal-case font-normal text-[#94a3b8]">(optional)</span></SectionHeading>

            {/* Latitude */}
            <Field label="Latitude" error={errors.latitude}>
              <input
                id="add-hall-latitude"
                type="number"
                step="any"
                className={`${inputCls} ${errors.latitude ? "border-red-400" : "border-[#e2e8f0]"}`}
                placeholder="e.g. 6.9271"
                value={form.latitude}
                onChange={(e) => set("latitude", e.target.value)}
                disabled={isSubmitting}
              />
            </Field>

            {/* Longitude */}
            <Field label="Longitude" error={errors.longitude}>
              <input
                id="add-hall-longitude"
                type="number"
                step="any"
                className={`${inputCls} ${errors.longitude ? "border-red-400" : "border-[#e2e8f0]"}`}
                placeholder="e.g. 79.8612"
                value={form.longitude}
                onChange={(e) => set("longitude", e.target.value)}
                disabled={isSubmitting}
              />
            </Field>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3 border-t border-[#f1f5f9]">
            <button
              id="btn-add-hall-cancel"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-[#e2e8f0] text-[#334155] font-semibold text-sm hover:bg-[#f8fafc] transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              id="btn-add-hall-confirm"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#1e3b8a] text-white font-semibold text-sm
                         flex items-center gap-1.5 hover:bg-[#162d6b] active:scale-[0.98]
                         transition-all shadow-[0_4px_12px_rgba(30,59,138,0.25)] disabled:opacity-60"
            >
              {isSubmitting ? (
                 <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                 <DoorOpen size={15} strokeWidth={2.5} />
              )}
              {isSubmitting ? "Adding..." : "Add Hall"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

