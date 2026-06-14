"use client";

/**
 * ManageHallModal — views/components/ManageHallModal.jsx
 *
 * Centered modal opened when admin clicks "Manage" on a hall row.
 * Allows editing hall details, location info, and removing the hall.
 *
 * Props:
 *   isOpen      {boolean}   — show/hide
 *   hall        {Object}    — hall object to display/edit
 *   onClose     {Function}
 *   onSave      {Function}  — (hallId, updateForm) => void
 *   onRemove    {Function}  — (hallId) => void
 */

import { useState, useEffect } from "react";
import {
  X,
  Pencil,
  Save,
  Trash2,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Map,
} from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import { validateLocationForm } from "@/controllers/hallController";

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
    <div className="flex items-center gap-2 mt-1">
      <span className="text-[#0f172a] font-bold text-xs uppercase tracking-widest whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-[#e2e8f0]" />
    </div>
  );
}

// ── Readonly detail row ────────────────────────────────────────────────────────
function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[#94a3b8] text-xs font-semibold uppercase tracking-wide">
        {label}
      </span>
      <span className="text-[#0f172a] text-sm font-medium">{value ?? "—"}</span>
    </div>
  );
}

// ── Map placeholder ────────────────────────────────────────────────────────────
function MapPlaceholder({ latitude, longitude }) {
  const hasCoords =
    latitude !== null && latitude !== undefined &&
    longitude !== null && longitude !== undefined;

  return (
    <div className="w-full h-36 rounded-xl bg-[#f1f5f9] border border-[#e2e8f0] flex flex-col items-center justify-center gap-2 relative overflow-hidden">
      {/* Subtle grid lines */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative flex flex-col items-center gap-1.5">
        <div className="w-10 h-10 rounded-full bg-[#1e3b8a]/10 flex items-center justify-center">
          <Map size={20} className="text-[#1e3b8a]" strokeWidth={1.5} />
        </div>
        {hasCoords ? (
          <>
            <span className="text-[#334155] text-xs font-semibold">Location Configured</span>
            <span className="text-[#94a3b8] text-xs font-mono">
              {Number(latitude).toFixed(6)}, {Number(longitude).toFixed(6)}
            </span>
          </>
        ) : (
          <>
            <span className="text-[#64748b] text-xs font-semibold">No Location Set</span>
            <span className="text-[#94a3b8] text-xs">Add coordinates below to configure</span>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────────
export default function ManageHallModal({ isOpen, hall, onClose, onSave, onRemove }) {
  const [form, setForm]                       = useState({});
  const [errors, setErrors]                   = useState({});
  const [isSaving, setIsSaving]               = useState(false);
  const [isRemoving, setIsRemoving]           = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  
  const [modalError, setModalError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Sync form when hall changes or modal opens
  useEffect(() => {
    if (isOpen && hall) {
      setForm({
        name: hall.name,
        capacity: hall.capacity,
        availability: hall.availability,
        latitude: hall.latitude ?? "",
        longitude: hall.longitude ?? "",
      });
      setErrors({});
      setModalError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, hall]);

  if (!isOpen || !hall) return null;

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setModalError(null);
    setSuccessMsg(null);
  }

  async function handleSave() {
    // Validate location fields
    const locErrors = validateLocationForm(form);
    if (Object.keys(locErrors).length > 0) {
      setErrors(locErrors);
      return;
    }
    // Basic name / capacity validation
    const fe = {};
    if (!form.name?.trim()) fe.name = "Hall name is required.";
    if (!form.capacity || isNaN(Number(form.capacity)) || Number(form.capacity) < 1) {
      fe.capacity = "Capacity must be a positive number.";
    }
    if (Object.keys(fe).length > 0) { setErrors(fe); return; }

    setIsSaving(true);
    setModalError(null);
    setSuccessMsg(null);
    try {
      await onSave(hall.hallId, form);
      setSuccessMsg("Changes saved successfully!");
      // Optionally clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setModalError(err.message || "Failed to save hall.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmRemove() {
    setIsRemoving(true);
    setModalError(null);
    try {
      await onRemove(hall.hallId);
      setShowRemoveConfirm(false);
    } catch (err) {
      setModalError(err.message || "Failed to remove hall.");
      setShowRemoveConfirm(false);
    } finally {
      setIsRemoving(false);
    }
  }

  const inputCls =
    "border border-[#e2e8f0] rounded-xl px-3 py-2.5 text-sm text-[#0f172a] bg-white " +
    "focus:outline-none focus:ring-2 focus:ring-[#1e3b8a]/30 focus:border-[#1e3b8a] transition w-full";

  const hasLocation =
    form.latitude !== "" && form.latitude !== null &&
    form.longitude !== "" && form.longitude !== null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 pointer-events-auto flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="bg-[#1e3b8a] px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-base">Manage Hall</h2>
              <p className="text-white/60 text-xs mt-0.5">{hall.hallId} · {hall.name}</p>
            </div>
            <button
              id="btn-manage-hall-close"
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
            
            {modalError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{modalError}</span>
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-700 text-sm flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ── Hall Information ── */}
            <SectionHeading>Hall Information</SectionHeading>

            {/* Hall ID — readonly */}
            <DetailRow label="Hall ID" value={hall.hallId} />

            {/* Hall Name */}
            <Field label="Hall Name" error={errors.name}>
              <input
                id="manage-hall-name"
                className={`${inputCls} ${errors.name ? "border-red-400" : ""}`}
                value={form.name ?? ""}
                onChange={(e) => set("name", e.target.value)}
                disabled={isSaving}
              />
            </Field>

            {/* Capacity */}
            <Field label="Capacity" error={errors.capacity}>
              <input
                id="manage-hall-capacity"
                type="number"
                min="1"
                className={`${inputCls} ${errors.capacity ? "border-red-400" : ""}`}
                value={form.capacity ?? ""}
                onChange={(e) => set("capacity", e.target.value)}
                disabled={isSaving}
              />
            </Field>

            {/* Availability */}
            <Field label="Availability" error={errors.availability}>
              <select
                id="manage-hall-availability"
                className={inputCls}
                value={form.availability ? "true" : "false"}
                onChange={(e) => set("availability", e.target.value === "true")}
                disabled={isSaving}
              >
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
            </Field>

            {/* ── Location Information ── */}
            <SectionHeading>Location Information</SectionHeading>

            {/* Map preview placeholder */}
            <MapPlaceholder latitude={form.latitude} longitude={form.longitude} />

            {/* Latitude */}
            <Field label="Latitude" error={errors.latitude}>
              <input
                id="manage-hall-latitude"
                type="number"
                step="any"
                className={`${inputCls} ${errors.latitude ? "border-red-400" : ""}`}
                placeholder="e.g. 6.9271"
                value={form.latitude ?? ""}
                onChange={(e) => set("latitude", e.target.value)}
                disabled={isSaving}
              />
            </Field>

            {/* Longitude */}
            <Field label="Longitude" error={errors.longitude}>
              <input
                id="manage-hall-longitude"
                type="number"
                step="any"
                className={`${inputCls} ${errors.longitude ? "border-red-400" : ""}`}
                placeholder="e.g. 79.8612"
                value={form.longitude ?? ""}
                onChange={(e) => set("longitude", e.target.value)}
                disabled={isSaving}
              />
            </Field>

            {/* ── Danger Zone ── */}
            <SectionHeading>Danger Zone</SectionHeading>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-red-700 font-semibold text-sm">Remove Hall</span>
                <span className="text-red-500 text-xs">
                  Permanently removes this hall. This cannot be undone.
                </span>
              </div>
              <button
                id="btn-manage-hall-remove"
                onClick={() => setShowRemoveConfirm(true)}
                disabled={isSaving || isRemoving}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600
                           text-white font-semibold text-xs hover:bg-red-700 active:scale-[0.98]
                           transition-all disabled:opacity-60"
              >
                <Trash2 size={13} strokeWidth={2.5} />
                Remove Hall
              </button>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3 border-t border-[#f1f5f9] bg-[#f8fafc]">
            <button
              id="btn-manage-hall-cancel"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl border border-[#e2e8f0] text-[#334155] font-semibold text-sm hover:bg-white transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              id="btn-manage-hall-save"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-[#1e3b8a] text-white font-semibold text-sm
                         flex items-center gap-1.5 hover:bg-[#162d6b] active:scale-[0.98]
                         transition-all shadow-[0_4px_12px_rgba(30,59,138,0.25)]
                         disabled:opacity-60"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={14} strokeWidth={2.5} />
              )}
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Remove confirmation ── */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h3 className="text-[#0f172a] font-bold text-lg">Remove Hall</h3>
            </div>

            {/* Details */}
            <div className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] px-4 py-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#94a3b8] text-xs font-semibold uppercase tracking-wide">Hall ID</span>
                <span className="text-[#0f172a] text-sm font-mono font-semibold">{hall.hallId}</span>
              </div>
              <div className="h-px bg-[#e2e8f0]" />
              <div className="flex items-center justify-between">
                <span className="text-[#94a3b8] text-xs font-semibold uppercase tracking-wide">Hall Name</span>
                <span className="text-[#0f172a] text-sm font-semibold">{hall.name}</span>
              </div>
            </div>

            {/* Message */}
            <p className="text-[#64748b] text-sm leading-6">
              Are you sure you want to remove this hall?
            </p>

            {/* Warning */}
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <span className="text-red-600 text-xs font-medium">
                This action cannot be undone.
              </span>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-1">
              <button
                id="btn-remove-hall-cancel"
                onClick={() => setShowRemoveConfirm(false)}
                disabled={isRemoving}
                className="px-5 py-2.5 rounded-xl border border-[#e2e8f0] text-[#334155] font-semibold text-sm hover:bg-[#f8fafc] transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                id="btn-remove-hall-confirm"
                onClick={handleConfirmRemove}
                disabled={isRemoving}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm flex items-center gap-1.5 transition-colors disabled:opacity-60"
              >
                {isRemoving ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 size={13} strokeWidth={2.5} />
                )}
                {isRemoving ? "Removing..." : "Remove Hall"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
