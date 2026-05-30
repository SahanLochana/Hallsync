"use client";

/**
 * TimetableViewPage — views/pages/timetable/TimetableViewPage.jsx (MVC View)
 *
 * Weekly grid timetable view.
 * - Mon–Fri columns, 8 am–5 pm rows
 * - Lecture blocks rendered as absolute overlays inside each column
 * - READ MODE (default): click a lecture → detail only (no edit/delete)
 * - EDIT MODE (toggle):  click lecture → full edit/delete modal
 *                        click empty slot → AddLectureModal (pre-filled day + time)
 * - All changes auto-saved to localStorage via controller
 *
 * Components used:
 *   TopHeader            (views/components/TopHeader.jsx)
 *   Sidebar              (views/components/Sidebar.jsx)
 *   LectureDetailModal   (views/components/LectureDetailModal.jsx)
 *   AddLectureModal      (views/components/AddLectureModal.jsx)
 *   ConfirmModal         (views/components/ConfirmModal.jsx)  — used inside LectureDetailModal
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Download, Pencil, X } from "lucide-react";

import TopHeader from "@/views/components/TopHeader";
import LectureDetailModal from "@/views/components/LectureDetailModal";
import AddLectureModal from "@/views/components/AddLectureModal";

import { DAYS, HOURS, HALF_HOURS, formatHour } from "@/models/timetableViewModel";
import {
  initLectures,
  handleLectureClick,
  handleCloseDetail,
  handleSaveEdit,
  handleConfirmDelete,
  handleAddLecture,
  handlePrevWeek,
  handleNextWeek,
  formatWeekLabel,
  getDayDate,
  getCurrentWeekMonday,
} from "@/controllers/timetableViewController";

// Grid constants
// Each 30-min slot = 30px tall. Two slots = 1 hour = 60px.
const SLOT_H  = 30;    // px per 30-min cell
const HEADER_H = 64;   // px for day-header row

export default function TimetableViewPage() {
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────────────
  const [lectures, setLectures]       = useState([]);
  const [weekStart, setWeekStart]     = useState(getCurrentWeekMonday);
  const [selected, setSelected]       = useState(null);   // clicked lecture
  const [showDetail, setShowDetail]   = useState(false);

  // Edit mode
  const [isEditMode, setIsEditMode]   = useState(false);

  // Add lecture modal
  const [addCell, setAddCell]         = useState(null);   // { day, startHour }

  // ── Load lectures on mount ─────────────────────────────────────────────
  useEffect(() => {
    initLectures(setLectures); // TODO: initLectures — loads from localStorage / API
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────
  const weekLabel = formatWeekLabel(weekStart);

  // Map day → lectures for that day
  function getLecturesForDay(day) {
    return lectures.filter((l) => l.day === day);
  }

  // Pixel top offset and height for a lecture block.
  function getLectureStyle(lec) {
    const top = (lec.startHour - HOURS[0]) * 2 * SLOT_H + HEADER_H;
    const h   = (lec.endHour  - lec.startHour) * 2 * SLOT_H;
    return { top: `${top}px`, height: `${h - 4}px` }; // -4px gap
  }

  // Total column height: header + 18 half-hour cells
  const gridH = HEADER_H + HALF_HOURS.length * SLOT_H;

  // ── Edit mode toggle ───────────────────────────────────────────────────
  function toggleEditMode() {
    setIsEditMode((prev) => !prev);
    // Close any open modals when toggling
    handleCloseDetail(setSelected, setShowDetail);
    setAddCell(null);
  }

  // ── Empty cell click (only in edit mode) ──────────────────────────────
  function handleCellClick(day, halfHour) {
    if (!isEditMode) return;
    setAddCell({ day, startHour: halfHour });
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#f8fafc]">

      {/* ── TOP HEADER ──────────────────────────────────────────────────── */}
      <TopHeader
        title="Information System | 2022/2023"
        actions={
          <div className="flex items-center gap-3">
            {/* Edit Mode Toggle */}
            <button
              id="btn-toggle-edit-mode"
              onClick={toggleEditMode}
              className={`
                font-semibold text-sm flex items-center gap-1.5 px-4 h-10 rounded-2xl
                active:scale-[0.98] transition-all
                ${isEditMode
                  ? "bg-amber-500 text-white hover:bg-amber-600 shadow-[0_4px_12px_rgba(245,158,11,0.35)]"
                  : "border-2 border-[#1e3b8a] text-[#1e3b8a] hover:bg-[#1e3b8a]/5"
                }
              `}
            >
              {isEditMode
                ? <><X size={14} strokeWidth={2.5} /> Exit Edit</>
                : <><Pencil size={14} strokeWidth={2.5} /> Edit Mode</>
              }
            </button>

            {/* Export */}
            <button
              id="btn-export"
              onClick={() => {/* TODO: handleExport — export timetable as PDF/image */}}
              className="bg-[#1e3b8a] text-white font-semibold text-sm flex items-center gap-1.5 px-4 h-10 rounded-2xl hover:bg-[#162d6b] active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(30,59,138,0.2)]"
            >
              <Download size={14} strokeWidth={2.5} />
              Export
            </button>
          </div>
        }
      />

      {/* ── EDIT MODE BANNER ────────────────────────────────────────────── */}
      {isEditMode && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 flex items-center gap-2 shrink-0">
          <Pencil size={13} className="text-amber-600" strokeWidth={2.5} />
          <span className="text-amber-700 text-xs font-semibold">
            Edit Mode — click any lecture to edit or delete, click an empty slot to add a new lecture
          </span>
        </div>
      )}

      {/* ── BODY (fills remaining height, no scroll) ─────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Main content — fills height, no external scroll */}
        <main className="flex-1 p-4 flex flex-col gap-4 min-w-0 overflow-hidden">

          {/* ── Calendar card — flex-1 takes remaining height, grid scrolls inside ── */}
          <div className="bg-white rounded-xl shadow-[0_8px_25px_rgba(226,232,240,0.75)] flex flex-col flex-1 min-h-0 overflow-hidden">

            {/* Week navigator */}
            <div className="flex items-center justify-center gap-10 py-2.5 border-b border-[#e2e8f0] shrink-0">
              <button
                id="btn-prev-week"
                onClick={() => handlePrevWeek(weekStart, setWeekStart)}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#f1f5f9] text-[#1e3b8a] transition-colors"
              >
                <ChevronLeft size={22} strokeWidth={2.5} />
              </button>
              <span className="font-semibold text-base text-[#0f172a] min-w-[180px] text-center">
                {weekLabel}
              </span>
              <button
                id="btn-next-week"
                onClick={() => handleNextWeek(weekStart, setWeekStart)}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#f1f5f9] text-[#1e3b8a] transition-colors"
              >
                <ChevronRight size={22} strokeWidth={2.5} />
              </button>
            </div>

            {/* ── GRID — only this area scrolls ───────────────────────── */}
            <div className="flex flex-1 min-h-0 overflow-auto">

              {/* Time column */}
              <div className="shrink-0 flex flex-col select-none" style={{ width: "64px" }}>
                {/* Spacer matching the day-header */}
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
                  const dayDate = getDayDate(weekStart, di);
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
                        <span className="text-[#94a3b8] text-xs font-normal">{dayDate}</span>
                      </div>

                      {/* 30-min slot cells — clickable in edit mode to add lecture */}
                      {HALF_HOURS.map((h) => (
                        <div
                          key={h}
                          className={`
                            border-b border-[#94a3b8]/40 transition-colors
                            ${isEditMode
                              ? "cursor-pointer hover:bg-amber-50/60 group"
                              : ""}
                          `}
                          style={{ height: `${SLOT_H}px` }}
                          onClick={() => handleCellClick(day, h)}
                        >
                          {/* Subtle + hint on hover in edit mode */}
                          {isEditMode && (
                            <span className="hidden group-hover:flex items-center justify-center h-full text-amber-400 text-lg font-light select-none pointer-events-none opacity-60">
                              +
                            </span>
                          )}
                        </div>
                      ))}

                      {/* Lecture blocks */}
                      {dayLectures.map((lec) => (
                        <button
                          key={lec.id}
                          id={`lecture-block-${lec.id}`}
                          onClick={(e) => {
                            e.stopPropagation(); // don't trigger cell click
                            handleLectureClick(lec, setSelected, setShowDetail);
                          }}
                          className={`
                            absolute left-1 right-1 rounded-lg text-white text-xs font-semibold
                            flex flex-col items-center justify-center text-center px-2
                            transition-all overflow-hidden
                            ${isEditMode
                              ? "bg-[#1e3b8a] hover:bg-[#2a4fa0] hover:shadow-lg active:scale-[0.98] cursor-pointer ring-2 ring-amber-400/0 hover:ring-amber-400/60"
                              : "bg-[#1e3b8a] hover:bg-[#2a4fa0] hover:shadow-md cursor-pointer"
                            }
                          `}
                          style={getLectureStyle(lec)}
                        >
                          <span className="leading-tight line-clamp-2">{lec.lectureName}</span>
                          <span className="text-white/60 text-[10px] mt-0.5 leading-tight">
                            {formatHour(lec.startHour)}–{formatHour(lec.endHour)}
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

      {/* ── LECTURE DETAIL MODAL ─────────────────────────────────────────── */}
      {showDetail && (
        <LectureDetailModal
          lecture={selected}
          isEditMode={isEditMode}
          onClose={() => handleCloseDetail(setSelected, setShowDetail)}
          onSaveEdit={(edited) =>
            handleSaveEdit(edited, lectures, setLectures, () =>
              handleCloseDetail(setSelected, setShowDetail)
            )
          }
          onDelete={(id) =>
            handleConfirmDelete(id, lectures, setLectures, () =>
              handleCloseDetail(setSelected, setShowDetail)
            )
          }
        />
      )}

      {/* ── ADD LECTURE MODAL ────────────────────────────────────────────── */}
      <AddLectureModal
        isOpen={!!addCell}
        defaultDay={addCell?.day}
        defaultStartHour={addCell?.startHour}
        onClose={() => setAddCell(null)}
        onConfirm={(newLec) =>
          handleAddLecture(newLec, lectures, setLectures, () => setAddCell(null))
        }
      />
    </div>
  );
}
