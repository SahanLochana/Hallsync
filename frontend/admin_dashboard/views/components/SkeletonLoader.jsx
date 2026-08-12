"use client";

/**
 * SkeletonLoader — views/components/SkeletonLoader.jsx
 * Reusable animated pulse skeleton loading placeholders for tables, cards, and pages.
 */

/**
 * TableSkeleton — Renders animated skeleton rows for data tables.
 * @param {number} columns - Number of columns in table (default 5)
 * @param {number} rows - Number of skeleton rows to render (default 5)
 */
export function TableSkeleton({ columns = 5, rows = 5 }) {
  return (
    <div className="w-full overflow-hidden">
      <table className="w-full text-left border-collapse">
        <tbody>
          {Array.from({ length: rows }).map((_, rIdx) => (
            <tr key={`skel-row-${rIdx}`} className="border-b border-[#94a3b8]/10 animate-pulse">
              {Array.from({ length: columns }).map((_, cIdx) => (
                <td key={`skel-cell-${rIdx}-${cIdx}`} className="py-4 px-4">
                  <div
                    className={`h-4 bg-slate-200 rounded-md ${
                      cIdx === 0 ? "w-24" : cIdx === 1 ? "w-40" : "w-20"
                    }`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * CardSkeleton — Renders animated skeleton cards for grid layouts.
 * @param {number} count - Number of skeleton cards to render (default 3)
 */
export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={`skel-card-${idx}`}
          className="bg-white rounded-2xl p-5 shadow-[0_8px_25px_rgba(226,232,240,0.75)] border border-[#e2e8f0]/60 flex flex-col gap-3 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="h-6 w-20 bg-slate-200 rounded-lg" />
            <div className="h-4 w-16 bg-slate-100 rounded" />
          </div>
          <div className="h-5 w-3/4 bg-slate-200 rounded" />
          <div className="h-12 bg-slate-100 rounded-xl mt-2" />
        </div>
      ))}
    </div>
  );
}

/**
 * TimetableGridSkeleton — Renders animated skeleton for the timetable calendar grid.
 */
export function TimetableGridSkeleton() {
  return (
    <div className="w-full h-full p-4 grid grid-cols-5 gap-3 animate-pulse">
      {Array.from({ length: 5 }).map((_, dIdx) => (
        <div key={`skel-day-${dIdx}`} className="flex flex-col gap-3">
          <div className="h-8 bg-slate-200 rounded-lg w-full" />
          <div className="h-24 bg-slate-100 rounded-xl w-full" />
          <div className="h-36 bg-slate-200/80 rounded-xl w-full" />
          <div className="h-20 bg-slate-100 rounded-xl w-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * PageSkeleton — Full page animated skeleton used during route loading / auth checking.
 */
export function PageSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] overflow-hidden animate-pulse">
      {/* Header Skeleton */}
      <header className="bg-white border-b border-[#e2e8f0] flex items-center justify-between px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-slate-200 w-10 h-10 rounded-2xl" />
          <div className="h-5 w-28 bg-slate-200 rounded-md" />
        </div>
        <div className="h-9 w-24 bg-slate-100 rounded-xl" />
      </header>

      {/* Main Layout Skeleton */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Skeleton */}
        <aside className="bg-white flex flex-col items-center py-6 px-2.5 gap-3 border-r border-[#e2e8f0] shrink-0 h-full w-16">
          <div className="w-10 h-10 bg-slate-200 rounded-2xl" />
          <div className="w-10 h-10 bg-slate-200 rounded-2xl" />
          <div className="w-10 h-10 bg-slate-200 rounded-2xl" />
          <div className="w-10 h-10 bg-slate-200 rounded-2xl" />
          <div className="w-10 h-10 bg-slate-200 rounded-2xl mt-auto" />
        </aside>

        {/* Content Skeleton */}
        <main className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
          <div className="flex flex-col gap-2">
            <div className="h-7 w-48 bg-slate-200 rounded-lg" />
            <div className="h-4 w-72 bg-slate-100 rounded-md" />
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-[0_8px_25px_rgba(226,232,240,0.75)] flex items-center gap-4">
            <div className="h-9 w-64 bg-slate-100 rounded-xl" />
            <div className="h-9 w-32 bg-slate-100 rounded-xl ml-auto" />
          </div>

          <div className="bg-[#ffffff] flex-1 rounded-2xl shadow-[0_8px_25px_rgba(226,232,240,0.75)] p-4">
            <TableSkeleton columns={5} rows={6} />
          </div>
        </main>
      </div>
    </div>
  );
}
