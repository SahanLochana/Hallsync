"use client";

/**
 * Timetable Page View — views/pages/timetable/TimetablePage.jsx (MVC)
 * Pure UI layer for the timetable list page.
 * Business logic is in timetableController.js.
 * Data shape is in timetableModel.js.
 *
 * Reusable components used:
 *   - TopHeader       (views/components/TopHeader.jsx)
 *   - Sidebar         (views/components/Sidebar.jsx)
 *   - PageHeader      (views/components/PageHeader.jsx)
 *   - TableSkeleton   (views/components/SkeletonLoader.jsx)
 *   - FilterDropdown  (views/components/FilterDropdown.jsx)
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, CalendarDays } from "lucide-react";

import TopHeader from "@/views/components/TopHeader";
import Sidebar from "@/views/components/Sidebar";
import PageHeader from "@/views/components/PageHeader";
import { TableSkeleton } from "@/views/components/SkeletonLoader";
import FilterDropdown from "@/views/components/FilterDropdown";

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

// ── Timetable table row ───────────────────────────────────────────────────────
function TimetableRow({ timetable, onClick }) {
  return (
    <tr
      onClick={() => onClick(timetable.id)}
      className="border-b border-[#94a3b8]/20 hover:bg-[#f8fafc] cursor-pointer transition-colors group"
    >
      <td className="py-4 pl-5 pr-3 font-semibold text-[#0f172a] text-sm group-hover:text-[#1e3b8a] transition-colors">
        {timetable.name}
      </td>
      <td className="py-4 px-3 text-[#334155] text-sm font-medium">
        {timetable.department}
      </td>
      <td className="py-4 px-3 text-[#334155] text-sm font-medium">
        {timetable.year}
      </td>
      <td className="py-4 pl-3 pr-5 text-[#64748b] text-sm">
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
            onClick={() =>
              handleCreateTimetable(() => router.push("/timetable/create"))
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
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (shared component) */}
        <Sidebar />

        {/* Main content area */}
        <main className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">

          {/* ── Page heading ─────────────────────────────────────────────── */}
          <PageHeader
            icon={CalendarDays}
            title="Timetable Management"
            subtitle="View, filter, and manage academic lecture timetables"
          />

          {/* ── FILTER BAR ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-[0_8px_25px_rgba(226,232,240,0.75)] px-5 py-3 flex items-center gap-4">
            <FilterDropdown
              id="filter-timetable-year"
              defaultOptionLabel="All Years"
              value={year}
              options={YEAR_OPTIONS}
              onChange={(val) => handleYearFilter(val, setYear)}
            />
            <FilterDropdown
              id="filter-timetable-department"
              defaultOptionLabel="All Departments"
              value={department}
              options={DEPARTMENT_OPTIONS}
              onChange={(val) => handleDepartmentFilter(val, setDepartment)}
            />
          </div>

          {/* ── TIMETABLE TABLE ─────────────────────────────────────────── */}
          <div className="bg-white flex-1 rounded-2xl shadow-[0_8px_25px_rgba(226,232,240,0.75)] overflow-auto">
            {/* Error state */}
            {error && (
              <div className="p-4 text-red-600 text-sm bg-red-50 border-b border-red-100">
                {error}
              </div>
            )}

            {/* Loading state */}
            {isLoading ? (
              <TableSkeleton columns={4} rows={5} />
            ) : (
              <table className="w-full text-left border-collapse">
                {/* Table header */}
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-[#94a3b8]/20">
                    <th className="py-3 pl-5 pr-3 text-[#94a3b8] text-[11px] font-bold uppercase tracking-wider w-[40%]">
                      Name
                    </th>
                    <th className="py-3 px-3 text-[#94a3b8] text-[11px] font-bold uppercase tracking-wider w-[25%]">
                      Department
                    </th>
                    <th className="py-3 px-3 text-[#94a3b8] text-[11px] font-bold uppercase tracking-wider w-[15%]">
                      Year
                    </th>
                    <th className="py-3 pl-3 pr-5 text-[#94a3b8] text-[11px] font-bold uppercase tracking-wider w-[20%]">
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
                        onClick={(id) =>
                          handleOpenTimetable(id, (tid) =>
                            router.push(`/timetable/view?id=${tid}`),
                          )
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
