"use client";

/**
 * Department Page View — views/pages/department/DepartmentPage.jsx (MVC)
 * UI view layer for displaying departments and lectures grouped by semester.
 */

import { useState, useEffect } from "react";
import {
  Building2,
  Search,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

import TopHeader from "@/views/components/TopHeader";
import Sidebar from "@/views/components/Sidebar";
import PageHeader from "@/views/components/PageHeader";
import { TableSkeleton } from "@/views/components/SkeletonLoader";

import { SEMESTER_OPTIONS, TYPE_OPTIONS } from "@/models/departmentModel";
import {
  fetchDepartments,
  filterLectures,
} from "@/controllers/departmentController";

// ── Department Code Color Badges ──────────────────────────────────────────────
const DEPT_THEMES = {
  CIS: {
    bg: "bg-blue-500/10 text-blue-600 border-blue-200",
    tabActive: "bg-[#1e3b8a] text-white shadow-md shadow-blue-900/20",
    badge: "bg-blue-100 text-blue-800",
  },
  SE: {
    bg: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    tabActive: "bg-emerald-700 text-white shadow-md shadow-emerald-900/20",
    badge: "bg-emerald-100 text-emerald-800",
  },
  DS: {
    bg: "bg-purple-500/10 text-purple-600 border-purple-200",
    tabActive: "bg-purple-700 text-white shadow-md shadow-purple-900/20",
    badge: "bg-purple-100 text-purple-800",
  },
  DEFAULT: {
    bg: "bg-slate-500/10 text-slate-600 border-slate-200",
    tabActive: "bg-slate-800 text-white shadow-md",
    badge: "bg-slate-100 text-slate-800",
  },
};

function getDeptTheme(code) {
  return DEPT_THEMES[code] || DEPT_THEMES.DEFAULT;
}

// ── Semester Section Component ───────────────────────────────────────────────
function SemesterSection({ semesterNum, lectures }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const totalCredits = lectures.reduce(
    (sum, l) => sum + (l.credits || 0),
    0
  );
  const compulsoryCount = lectures.filter(
    (l) => l.type === "Compulsory"
  ).length;
  const electiveCount = lectures.filter((l) => l.type === "Elective").length;

  return (
    <div className="border border-[#e2e8f0] rounded-2xl overflow-hidden bg-white shadow-sm transition-all hover:shadow-md">
      {/* Semester Header Bar */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="bg-[#f8fafc] px-5 py-3.5 border-b border-[#e2e8f0] flex items-center justify-between cursor-pointer select-none hover:bg-slate-100/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1e3b8a] text-white font-bold text-sm flex items-center justify-center shadow-sm">
            {semesterNum}
          </div>
          <div>
            <h4 className="text-[#0f172a] font-bold text-base flex items-center gap-2">
              Semester {semesterNum}
              <span className="text-xs font-normal text-[#64748b]">
                ({lectures.length} {lectures.length === 1 ? "Course" : "Courses"})
              </span>
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Metadata Badges */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-slate-200/70 text-slate-700 font-semibold">
              {totalCredits} Credits
            </span>
            {compulsoryCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                {compulsoryCount} Compulsory
              </span>
            )}
            {electiveCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold">
                {electiveCount} Elective
              </span>
            )}
          </div>

          <button className="text-[#64748b] hover:text-[#0f172a] p-1">
            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>

      {/* Lectures Table for this Semester */}
      {!isCollapsed && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#e2e8f0] text-[#94a3b8] text-[11px] font-bold uppercase tracking-wider">
                <th className="py-2.5 px-4">Dept</th>
                <th className="py-2.5 px-4">Code</th>
                <th className="py-2.5 px-4">Course Title</th>
                <th className="py-2.5 px-4">Credits</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Grading</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {lectures.map((lec, idx) => {
                const theme = getDeptTheme(lec.departmentCode);
                return (
                  <tr
                    key={`${lec.departmentCode}-${lec.courseCode}-${idx}`}
                    className="hover:bg-[#f8fafc] transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-xs whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${theme.badge}`}
                      >
                        {lec.departmentCode}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-xs text-[#1e3b8a] whitespace-nowrap">
                      {lec.courseCode}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-[#0f172a]">
                      {lec.courseTitle}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#334155] whitespace-nowrap">
                      {lec.credits !== null && lec.credits !== undefined
                        ? `${lec.credits} ${
                            lec.credits === 1 ? "Credit" : "Credits"
                          }`
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-xs whitespace-nowrap">
                      {lec.type === "Compulsory" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          Compulsory
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          Elective
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs whitespace-nowrap">
                      {lec.nonGpa ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                          Non-GPA
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700">
                          GPA
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main View Component ──────────────────────────────────────────────────────
export default function DepartmentPage() {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedDeptCode, setSelectedDeptCode] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  // Load data on mount
  useEffect(() => {
    fetchDepartments(setDepartments, setIsLoading, setError);
  }, []);

  // Active department or all
  const activeDepartments =
    selectedDeptCode === "All"
      ? departments
      : departments.filter((d) => d.departmentCode === selectedDeptCode);

  // Collect all lectures across selected departments
  const allTargetLectures = activeDepartments.flatMap((d) =>
    (d.lectures || []).map((lec) => ({
      ...lec,
      departmentCode: d.departmentCode,
      departmentName: d.departmentName,
    }))
  );

  const filteredLectures = filterLectures(
    allTargetLectures,
    search,
    selectedSemester,
    selectedType
  );

  // Group filtered lectures by Semester (1 through 8)
  const lecturesBySemester = filteredLectures.reduce((acc, lec) => {
    const sem = lec.semester || 1;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(lec);
    return acc;
  }, {});

  const sortedSemesters = Object.keys(lecturesBySemester)
    .map(Number)
    .sort((a, b) => a - b);

  const isFiltered =
    search.trim() !== "" ||
    selectedSemester !== "All" ||
    selectedType !== "All" ||
    selectedDeptCode !== "All";

  function handleClearFilters() {
    setSearch("");
    setSelectedSemester("All");
    setSelectedType("All");
    setSelectedDeptCode("All");
  }

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc]">
      {/* Top Header */}
      <TopHeader title="Department Management" />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Content Area */}
        <main className="flex-1 p-6 flex flex-col gap-6 overflow-auto">
          {/* Header Title */}
          <PageHeader
            icon={Building2}
            title="Academic Departments"
            subtitle="Explore departments, degree programs, and curriculum lectures divided by semester"
          />

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => fetchDepartments(setDepartments, setIsLoading, setError)}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-lg font-medium text-xs transition"
              >
                Retry Loading
              </button>
            </div>
          )}

          {/* Loading state */}
          {isLoading ? (
            <div className="bg-white rounded-2xl p-6 shadow-[0_8px_25px_rgba(226,232,240,0.75)]">
              <TableSkeleton columns={6} rows={5} />
            </div>
          ) : (
            <>
              {/* Department Filter Tabs & Search Bar */}

              {/* Department Filter Tabs & Search Bar */}
              <div className="bg-white rounded-2xl shadow-[0_8px_25px_rgba(226,232,240,0.75)] p-5 flex flex-col gap-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Department Tabs */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setSelectedDeptCode("All")}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        selectedDeptCode === "All"
                          ? "bg-[#1e3b8a] text-white shadow-md"
                          : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
                      }`}
                    >
                      All Departments ({departments.length})
                    </button>
                    {departments.map((d) => {
                      const isActive = selectedDeptCode === d.departmentCode;
                      return (
                        <button
                          key={d.departmentCode}
                          onClick={() => setSelectedDeptCode(d.departmentCode)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? "bg-[#1e3b8a] text-white shadow-md"
                              : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
                          }`}
                        >
                          {d.departmentCode} ({d.lectures?.length || 0})
                        </button>
                      );
                    })}
                  </div>

                  {/* Search and Dropdowns */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[200px]">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                      />
                      <input
                        type="text"
                        placeholder="Search course code or title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#f1f5f9] text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#1e3b8a]/30"
                      />
                      {search && (
                        <button
                          onClick={() => setSearch("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#334155]"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Semester Select */}
                    <div className="relative">
                      <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="appearance-none bg-[#f1f5f9] text-[#64748b] font-semibold text-xs pl-3 pr-8 py-2 rounded-xl cursor-pointer focus:outline-none hover:bg-[#e2e8f0] transition-colors"
                      >
                        {SEMESTER_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none"
                      />
                    </div>

                    {/* Course Type Select */}
                    <div className="relative">
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="appearance-none bg-[#f1f5f9] text-[#64748b] font-semibold text-xs pl-3 pr-8 py-2 rounded-xl cursor-pointer focus:outline-none hover:bg-[#e2e8f0] transition-colors"
                      >
                        {TYPE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt === "All" ? "All Types" : opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none"
                      />
                    </div>

                    {/* Clear Button */}
                    {isFiltered && (
                      <button
                        onClick={handleClearFilters}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-[#64748b] hover:bg-[#f1f5f9] transition"
                      >
                        <X size={14} /> Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Lectures Divided by Semester */}
                {sortedSemesters.length === 0 ? (
                  <div className="py-12 text-center text-[#94a3b8] text-sm bg-[#f8fafc] rounded-2xl border border-dashed border-[#cbd5e1]">
                    No lectures found matching the selected filters.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {sortedSemesters.map((semNum) => (
                      <SemesterSection
                        key={`semester-${semNum}`}
                        semesterNum={semNum}
                        lectures={lecturesBySemester[semNum]}
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-[#94a3b8] pt-2">
                  <span>
                    Showing {filteredLectures.length} courses across{" "}
                    {sortedSemesters.length} {sortedSemesters.length === 1 ? "semester" : "semesters"}
                  </span>
                  {selectedDeptCode !== "All" && (
                    <span>Filter active: Department {selectedDeptCode}</span>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
