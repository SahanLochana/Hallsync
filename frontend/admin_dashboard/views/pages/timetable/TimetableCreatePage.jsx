"use client";

/**
 * TimetableCreatePage — views/pages/timetable/TimetableCreatePage.jsx (MVC View)
 *
 * Blank weekly grid for creating a new timetable from scratch.
 * - Always in edit mode — every empty cell is clickable to add a lecture
 * - Meta bar: Name, Department, Year inputs at top of the grid card
 * - Click a draft lecture block → remove it from the draft
 * - "Save Timetable" persists to localStorage and navigates to /timetable
 *
 * Reused components:
 *   TopHeader        (views/components/TopHeader.jsx)
 *   Sidebar          (views/components/Sidebar.jsx)
 *   AddLectureModal  (views/components/AddLectureModal.jsx)
 *   ConfirmModal     (views/components/ConfirmModal.jsx)
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ChevronDown, AlertCircle } from "lucide-react";

import TopHeader from "@/views/components/TopHeader";
import AddLectureModal from "@/views/components/AddLectureModal";
import ConfirmModal from "@/views/components/ConfirmModal";

import {
  DAYS, HOURS, HALF_HOURS, formatHour,
  INITIAL_META, DEPARTMENT_OPTIONS, YEAR_OPTIONS,
} from "@/models/timetableCreateModel";

import {
  handleAddDraftLecture,
  handleRemoveDraftLecture,
  handleSaveTimetable,
} from "@/controllers/timetableCreateController";

// Grid constants — match TimetableViewPage
const SLOT_H   = 30;   // px per 30-min cell
const HEADER_H = 64;   // px for day-header row

// ── Small select dropdown ─────────────────────────────────────────────────────
function MetaSelect({ id, value, options, placeholder, onChange }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a] text-sm
                   font-medium pl-3 pr-8 py-2 rounded-lg focus:outline-none focus:ring-2
                   focus:ring-[#1e3b8a]/25 focus:border-[#1e3b8a] transition cursor-pointer
                   min-w-[160px]"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none"
      />
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────
export default function TimetableCreatePage() {
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────────────────
  const [meta, setMeta]         = useState(INITIAL_META);
  const [lectures, setLectures] = useState([]);

  // Add lecture modal
  const [addCell, setAddCell]   = useState(null);   // { day, startHour }

  // Remove lecture confirm modal
  const [removeId, setRemoveId] = useState(null);   // lecture.id to remove

  // Save error
  const [saveError, setSaveError] = useState(null);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function updateMeta(field, value) {
    setMeta((prev) => ({ ...prev, [field]: value }));
    setSaveError(null);
  }

  function getLecturesForDay(day) {
    return lectures.filter((l) => l.day === day);
  }

  function getLectureStyle(lec) {
    const top = (lec.startHour - HOURS[0]) * 2 * SLOT_H + HEADER_H;
    const h   = (lec.endHour - lec.startHour) * 2 * SLOT_H;
    return { top: `${top}px`, height: `${h - 4}px` };
  }

  const gridH = HEADER_H + HALF_HOURS.length * SLOT_H;

  // ── Save handler ───────────────────────────────────────────────────────────
  function onSave() {
    const result = handleSaveTimetable(meta, lectures, router);
    if (!result.ok) setSaveError(result.error);
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#f8fafc]">

      {/* ── TOP HEADER ────────────────────────────────────────────────────── */}
      <TopHeader
        title="Create Timetable"
        actions={
          <button
            id="btn-save-timetable"
            onClick={onSave}
            className="bg-[#1e3b8a] text-white font-semibold text-sm flex items-center gap-1.5
                       px-4 h-10 rounded-2xl hover:bg-[#162d6b] active:scale-[0.98]
                       transition-all shadow-[0_4px_12px_rgba(30,59,138,0.25)]"
          >
            <Save size={14} strokeWidth={2.5} />
            Save Timetable
          </button>
        }
      />

      {/* ── BODY ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        <main className="flex-1 p-4 flex flex-col gap-4 min-w-0 overflow-hidden">

          {/* ── Save error banner ──────────────────────────────────────── */}
          {saveError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2 shrink-0">
              <AlertCircle size={15} className="text-red-500 shrink-0" />
              <span className="text-red-600 text-sm font-medium">{saveError}</span>
            </div>
          )}

          {/* ── Grid card ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-[0_8px_25px_rgba(226,232,240,0.75)] flex flex-col flex-1 min-h-0 overflow-hidden">

            {/* Meta bar — Name, Department, Year ───────────────────── */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-[#e2e8f0] shrink-0 flex-wrap">
              {/* Timetable name */}
              <input
                id="meta-name"
                type="text"
                placeholder="Timetable name…"
                value={meta.name}
                onChange={(e) => updateMeta("name", e.target.value)}
                className="flex-1 min-w-[180px] bg-[#f8fafc] border border-[#e2e8f0] text-[#0f172a]
                           text-sm font-medium px-3 py-2 rounded-lg focus:outline-none
                           focus:ring-2 focus:ring-[#1e3b8a]/25 focus:border-[#1e3b8a] transition"
              />

              <MetaSelect
                id="meta-department"
                value={meta.department}
                options={DEPARTMENT_OPTIONS}
                placeholder="Department…"
                onChange={(v) => updateMeta("department", v)}
              />

              <MetaSelect
                id="meta-year"
                value={meta.year}
                options={YEAR_OPTIONS}
                placeholder="Year…"
                onChange={(v) => updateMeta("year", v)}
              />

              {/* Draft lecture count badge */}
              {lectures.length > 0 && (
                <span className="ml-auto text-xs font-semibold text-[#1e3b8a] bg-[#1e3b8a]/10 px-2.5 py-1 rounded-full shrink-0">
                  {lectures.length} lecture{lectures.length !== 1 ? "s" : ""} added
                </span>
              )}
            </div>

            {/* ── Edit-mode hint strip ──────────────────────────────── */}
            <div className="bg-amber-50 border-b border-amber-100 px-5 py-1.5 flex items-center gap-2 shrink-0">
              <span className="text-amber-600 text-[11px] font-semibold">
                Click any empty slot to add a lecture · Click a lecture block to remove it
              </span>
            </div>

            {/* ── Scrollable grid ────────────────────────────────────── */}
            <div className="flex flex-1 min-h-0 overflow-auto">

              {/* Time column */}
              <div className="shrink-0 flex flex-col select-none" style={{ width: "64px" }}>
                <div style={{ height: `${HEADER_H}px` }} />
                {HOURS.map((h, i) => (
                  <div
                    key={h}
                    className="relative"
                    style={{ height: i < HOURS.length - 1 ? `${SLOT_H * 2}px` : "0px" }}
                  >
                    <span className="absolute -top-[9px] right-2 text-[#64748b] font-semibold text-[11px] whitespace-nowrap">
                      {formatHour(h)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              <div className="flex flex-1">
                {DAYS.map((day, di) => {
                  const dayLectures = getLecturesForDay(day);
                  const isFirst = di === 0;
                  const isLast  = di === DAYS.length - 1;

                  return (
                    <div
                      key={day}
                      className="flex-1 relative border-l border-[#94a3b8]/40 min-w-[150px]"
                      style={{ height: `${gridH}px` }}
                    >
                      {/* Day header */}
                      <div
                        className={`
                          flex flex-col items-center justify-center border border-[#94a3b8]/40
                          font-semibold text-[#0f172a] text-sm bg-white
                          ${isFirst ? "rounded-tl-lg" : ""}
                          ${isLast  ? "rounded-tr-lg" : ""}
                        `}
                        style={{ height: `${HEADER_H}px` }}
                      >
                        <span>{day}</span>
                      </div>

                      {/* 30-min cells — always clickable */}
                      {HALF_HOURS.map((h) => (
                        <div
                          key={h}
                          className="border-b border-[#94a3b8]/30 cursor-pointer transition-colors
                                     hover:bg-amber-50/70 group"
                          style={{ height: `${SLOT_H}px` }}
                          onClick={() => setAddCell({ day, startHour: h })}
                        >
                          <span className="hidden group-hover:flex items-center justify-center h-full
                                           text-amber-400 text-base font-light select-none
                                           pointer-events-none opacity-60">
                            +
                          </span>
                        </div>
                      ))}

                      {/* Draft lecture blocks */}
                      {dayLectures.map((lec) => (
                        <button
                          key={lec.id}
                          id={`draft-block-${lec.id}`}
                          title="Click to remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRemoveId(lec.id);
                          }}
                          className="absolute left-1 right-1 rounded-lg text-white text-xs font-semibold
                                     flex flex-col items-center justify-center text-center px-2
                                     bg-[#1e3b8a] hover:bg-red-500 active:scale-[0.98]
                                     transition-all overflow-hidden cursor-pointer group"
                          style={getLectureStyle(lec)}
                        >
                          <span className="leading-tight line-clamp-2 group-hover:hidden">
                            {lec.lectureName}
                          </span>
                          <span className="text-white/70 text-[10px] mt-0.5 leading-tight group-hover:hidden">
                            {formatHour(lec.startHour)}–{formatHour(lec.endHour)}
                          </span>
                          {/* Remove hint on hover */}
                          <span className="hidden group-hover:flex items-center gap-1 text-white text-[11px] font-semibold">
                            ✕ Remove
                          </span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── ADD LECTURE MODAL ──────────────────────────────────────────────── */}
      <AddLectureModal
        isOpen={!!addCell}
        defaultDay={addCell?.day}
        defaultStartHour={addCell?.startHour}
        onClose={() => setAddCell(null)}
        onConfirm={(newLec) =>
          handleAddDraftLecture(newLec, lectures, setLectures, () => setAddCell(null))
        }
      />

      {/* ── REMOVE LECTURE CONFIRM ─────────────────────────────────────────── */}
      <ConfirmModal
        isOpen={!!removeId}
        title="Remove Lecture?"
        message="Remove this lecture from the draft? This cannot be undone."
        confirmLabel="Remove"
        confirmStyle="danger"
        onCancel={() => setRemoveId(null)}
        onConfirm={() => {
          handleRemoveDraftLecture(removeId, lectures, setLectures);
          setRemoveId(null);
        }}
      />
    </div>
  );
}
