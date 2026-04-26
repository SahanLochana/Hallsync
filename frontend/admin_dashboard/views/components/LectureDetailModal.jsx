"use client";

/**
 * LectureDetailModal — views/components/LectureDetailModal.jsx
 *
 * Popup that appears when a user clicks a lecture block.
 * Shows lecture details, and has Edit / Delete buttons.
 * Edit mode shows inline form fields.
 * Saving edits and deleting both trigger a ConfirmModal.
 *
 * Props:
 *   lecture      {Object}   — the lecture to show
 *   onClose      {Function}
 *   onSaveEdit   {Function} — (editedLecture) => void
 *   onDelete     {Function} — (id) => void
 */

import { useState, useEffect } from "react";
import { X, Pencil, Trash2, Clock, MapPin, User, BookOpen } from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import { DAYS, HOURS, HALF_HOURS, formatHour } from "@/models/timetableViewModel";

export default function LectureDetailModal({ lecture, onClose, onSaveEdit, onDelete, isEditMode = true }) {
  if (!lecture) return null;

  // ── Edit state ──────────────────────────────────────────────────────────
  const [isEditing, setIsEditing]             = useState(false);
  const [form, setForm]                       = useState({ ...lecture });
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDelConfirm, setShowDelConfirm]   = useState(false);

  // Sync when lecture prop changes
  useEffect(() => {
    setForm({ ...lecture });
    setIsEditing(false);
  }, [lecture]);

  function handleFieldChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // ── View mode ────────────────────────────────────────────────────────────
  const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-[#1e3b8a]">
        <Icon size={16} strokeWidth={2} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[#94a3b8] text-xs font-semibold uppercase tracking-wide">{label}</span>
        <span className="text-[#0f172a] text-sm font-medium">{value}</span>
      </div>
    </div>
  );

  const timePeriod = `${formatHour(lecture.startHour)} – ${formatHour(lecture.endHour)}`;
  const editTimePeriod = `${formatHour(form.startHour)} – ${formatHour(form.endHour)}`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="fixed z-50 inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 pointer-events-auto flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header bar */}
          <div className="bg-[#1e3b8a] px-6 py-4 flex items-center justify-between">
            <h2 className="text-white font-bold text-base">
              {isEditing ? "Edit Lecture" : "Lecture Details"}
            </h2>
            <button
              id="btn-detail-close"
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col gap-5">
            {isEditing ? (
              /* ── EDIT FORM ─────────────────────────────────────────── */
              <div className="flex flex-col gap-4">
                {/* Lecture Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#334155] font-semibold text-xs uppercase tracking-wide">
                    Lecture Name
                  </label>
                  <input
                    id="edit-lecture-name"
                    className="border border-[#e2e8f0] rounded-xl px-3 py-2.5 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#1e3b8a]/30 focus:border-[#1e3b8a] transition"
                    value={form.lectureName}
                    onChange={(e) => handleFieldChange("lectureName", e.target.value)}
                  />
                </div>

                {/* Lecturer Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#334155] font-semibold text-xs uppercase tracking-wide">
                    Lecturer Name
                  </label>
                  <input
                    id="edit-lecturer-name"
                    className="border border-[#e2e8f0] rounded-xl px-3 py-2.5 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#1e3b8a]/30 focus:border-[#1e3b8a] transition"
                    value={form.lecturerName}
                    onChange={(e) => handleFieldChange("lecturerName", e.target.value)}
                  />
                </div>

                {/* Day */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#334155] font-semibold text-xs uppercase tracking-wide">
                    Day
                  </label>
                  <select
                    id="edit-day"
                    className="border border-[#e2e8f0] rounded-xl px-3 py-2.5 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#1e3b8a]/30 focus:border-[#1e3b8a] transition bg-white"
                    value={form.day}
                    onChange={(e) => handleFieldChange("day", e.target.value)}
                  >
                    {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Time period — start & end */}
                <div className="flex gap-3">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-[#334155] font-semibold text-xs uppercase tracking-wide">
                      Start Time
                    </label>
                    <select
                      id="edit-start-hour"
                      className="border border-[#e2e8f0] rounded-xl px-3 py-2.5 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#1e3b8a]/30 focus:border-[#1e3b8a] transition bg-white"
                      value={form.startHour}
                      onChange={(e) => handleFieldChange("startHour", Number(e.target.value))}
                    >
                      {HALF_HOURS.slice(0, -1).map((h) => (
                        <option key={h} value={h}>{formatHour(h)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-[#334155] font-semibold text-xs uppercase tracking-wide">
                      End Time
                    </label>
                    <select
                      id="edit-end-hour"
                      className="border border-[#e2e8f0] rounded-xl px-3 py-2.5 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#1e3b8a]/30 focus:border-[#1e3b8a] transition bg-white"
                      value={form.endHour}
                      onChange={(e) => handleFieldChange("endHour", Number(e.target.value))}
                    >
                      {HALF_HOURS.filter((h) => h > form.startHour).map((h) => (
                        <option key={h} value={h}>{formatHour(h)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#334155] font-semibold text-xs uppercase tracking-wide">
                    Location
                  </label>
                  <input
                    id="edit-location"
                    className="border border-[#e2e8f0] rounded-xl px-3 py-2.5 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#1e3b8a]/30 focus:border-[#1e3b8a] transition"
                    value={form.location}
                    onChange={(e) => handleFieldChange("location", e.target.value)}
                  />
                </div>
              </div>
            ) : (
              /* ── DETAIL VIEW ────────────────────────────────────────── */
              <div className="flex flex-col gap-4">
                <DetailRow icon={BookOpen} label="Lecture"   value={lecture.lectureName} />
                <DetailRow icon={User}     label="Lecturer"  value={lecture.lecturerName} />
                <DetailRow icon={Clock}    label="Time"      value={timePeriod} />
                <DetailRow icon={MapPin}   label="Location"  value={lecture.location} />
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="px-6 pb-6 flex items-center justify-between gap-3">
            {isEditing ? (
              <>
                <button
                  id="btn-edit-cancel"
                  onClick={() => { setIsEditing(false); setForm({ ...lecture }); }}
                  className="px-5 py-2.5 rounded-xl border border-[#e2e8f0] text-[#334155] font-semibold text-sm hover:bg-[#f8fafc] transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-edit-save"
                  onClick={() => setShowSaveConfirm(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#1e3b8a] text-white font-semibold text-sm hover:bg-[#162d6b] transition-colors"
                >
                  Save Changes
                </button>
              </>
            ) : isEditMode ? (
              <>
                <button
                  id="btn-lecture-delete"
                  onClick={() => setShowDelConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={15} /> Delete
                </button>
                <button
                  id="btn-lecture-edit"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e3b8a] text-white font-semibold text-sm hover:bg-[#162d6b] transition-colors"
                >
                  <Pencil size={15} /> Edit
                </button>
              </>
            ) : (
              /* Read-only mode — just a close button */
              <button
                id="btn-detail-close-readonly"
                onClick={onClose}
                className="ml-auto px-5 py-2.5 rounded-xl bg-[#f1f5f9] text-[#334155] font-semibold text-sm hover:bg-[#e2e8f0] transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Save confirmation */}
      <ConfirmModal
        isOpen={showSaveConfirm}
        title="Save Changes?"
        message="Are you sure you want to save the changes to this lecture? The timetable will be updated immediately."
        confirmLabel="Save"
        confirmStyle="primary"
        onCancel={() => setShowSaveConfirm(false)}
        onConfirm={() => {
          setShowSaveConfirm(false);
          onSaveEdit(form); // calls controller → updates grid + localStorage
          setIsEditing(false);
        }}
      />

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={showDelConfirm}
        title="Delete Lecture?"
        message={`Are you sure you want to delete "${lecture.lectureName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmStyle="danger"
        onCancel={() => setShowDelConfirm(false)}
        onConfirm={() => {
          setShowDelConfirm(false);
          onDelete(lecture.id); // calls controller → removes from grid + localStorage
        }}
      />
    </>
  );
}
