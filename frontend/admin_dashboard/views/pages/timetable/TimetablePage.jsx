"use client";

/**
 * Timetable Page View — views/pages/timetable/TimetablePage.jsx (MVC)
 * Pure UI layer for the timetable list page.
 * Business logic is in timetableController.js.
 * Data shape is in timetableModel.js.
 *
 * Reusable components used:
 *   - TopHeader    (views/components/TopHeader.jsx)
 *   - Sidebar      (views/components/Sidebar.jsx)
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronDown } from "lucide-react";

import TopHeader from "@/views/components/TopHeader";
import Sidebar from "@/views/components/Sidebar";

import {
  initialFilterState,
  YEAR_OPTIONS,
  DEPARTMENT_OPTIONS,
} from "@/models/timetableModel";
import {
  fetchTimetables,
  filterTimetables,
  handleYearFilter,
  handleDepartmentFilter,
  handleCreateTimetable,
  handleOpenTimetable,
} from "@/controllers/timetableController";

// ── Small reusable filter dropdown ────────────────────────────────────────────
function FilterDropdown({ label, value, options, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-[#f1f1f1] text-[#64748b] font-semibold text-sm
                   pl-3 pr-8 py-2.5 rounded-lg cursor-pointer focus:outline-none
                   hover:bg-[#e8eaed] transition-colors"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt === "All" ? label : opt}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none"
      />
    </div>
  );
}

// ── Timetable table row ───────────────────────────────────────────────────────
function TimetableRow({ timetable, onClick }) {
  return (
    <tr
      onClick={() => onClick(timetable.id)}
      className="border-b border-[#94a3b8]/30 hover:bg-[#f8fafc] cursor-pointer transition-colors group"
    >
      <td className="py-4 pl-4 pr-2 font-semibold text-[#0f172a] text-sm group-hover:text-[#1e3b8a] transition-colors">
        {timetable.name}
      </td>
      <td className="py-4 px-2 text-[rgba(0,0,0,0.7)] text-sm">
        {timetable.department}
      </td>
      <td className="py-4 px-2 text-[rgba(0,0,0,0.7)] text-sm">
        {timetable.year}
      </td>
      <td className="py-4 pl-2 pr-4 text-[rgba(0,0,0,0.7)] text-sm">
        {timetable.lastModified}
      </td>
    </tr>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────
export default function TimetablePage() {
  const router = useRouter();

  // ── State (shape from model) ────────────────────────────────────────────
  const [timetables, setTimetables] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(initialFilterState.year);
  const [department, setDepartment] = useState(initialFilterState.department);

  // ── Load timetables on mount (calls controller → model) ────────────────
  useEffect(() => {
    // TODO: fetchTimetables — fetches from backend API
    fetchTimetables(setTimetables, setIsLoading, setError);
  }, []);

  // ── Filtered list (pure controller function) ────────────────────────────
  const filteredTimetables = filterTimetables(timetables, year, department);

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc]">
      {/* ── TOP HEADER ────────────────────────────────────────────────── */}
      <TopHeader
        title="Timetable Management"
        actions={
          <button
            id="btn-create-timetable"
            onClick={
              () =>
                handleCreateTimetable(() => router.push("/timetable/create"))
              // TODO: handleCreateTimetable — navigate to timetable create page
            }
            className="bg-[#1e3b8a] text-white font-semibold text-sm
                       flex items-center gap-1.5 px-4 h-10 rounded-2xl
                       hover:bg-[#162d6b] active:scale-[0.98] transition-all
                       shadow-[0_4px_12px_rgba(30,59,138,0.25)]"
          >
            <Plus size={15} strokeWidth={2.5} />
            Create
          </button>
        }
      />

      {/* ── BODY — SIDEBAR + CONTENT ───────────────────────────────────── */}
      <div className="flex flex-1">
        {/* Sidebar (shared component) */}
        <Sidebar />

        {/* Main content area */}
        <main className="flex-1 p-5 flex flex-col gap-5">
          {/* ── FILTER BAR ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-[0_8px_25px_rgba(226,232,240,0.75),8px_0_25px_rgba(226,232,240,0.75)] px-5 py-2.5 flex items-center gap-4">
            <FilterDropdown
              label="Year"
              value={year}
              options={YEAR_OPTIONS}
              onChange={(val) => handleYearFilter(val, setYear)}
            />
            <FilterDropdown
              label="Department"
              value={department}
              options={DEPARTMENT_OPTIONS}
              onChange={(val) => handleDepartmentFilter(val, setDepartment)}
            />
          </div>

          {/* ── TIMETABLE TABLE ─────────────────────────────────────────── */}
          <div className="bg-white flex-1 rounded-xl shadow-[0_8px_25px_rgba(226,232,240,0.75),8px_0_25px_rgba(226,232,240,0.75)] overflow-hidden">
            {/* Error state */}
            {error && (
              <div className="p-4 text-red-600 text-sm bg-red-50 border-b border-red-100">
                {error}
              </div>
            )}

            {/* Loading state */}
            {isLoading ? (
              <div className="flex items-center justify-center h-48 text-[#94a3b8] text-sm">
                Loading timetables…
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                {/* Table header */}
                <thead>
                  <tr className="border-b border-[#94a3b8]/30">
                    <th className="py-2.5 pl-4 pr-2 text-[rgba(0,0,0,0.5)] font-semibold text-sm w-[40%]">
                      Name
                    </th>
                    <th className="py-2.5 px-2 text-[rgba(0,0,0,0.5)] font-semibold text-sm w-[25%]">
                      Department
                    </th>
                    <th className="py-2.5 px-2 text-[rgba(0,0,0,0.5)] font-semibold text-sm w-[15%]">
                      Year
                    </th>
                    <th className="py-2.5 pl-2 pr-4 text-[rgba(0,0,0,0.5)] font-semibold text-sm w-[20%]">
                      Last Modified
                    </th>
                  </tr>
                </thead>

                {/* Table body */}
                <tbody>
                  {filteredTimetables.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-12 text-center text-[#94a3b8] text-sm"
                      >
                        No timetables found.
                      </td>
                    </tr>
                  ) : (
                    filteredTimetables.map((t) => (
                      <TimetableRow
                        key={t.id}
                        timetable={t}
                        onClick={
                          (id) =>
                            handleOpenTimetable(id, (tid) =>
                              router.push(`/timetable/${tid}`),
                            )
                          // TODO: handleOpenTimetable — navigate to timetable detail/edit page
                        }
                      />
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
