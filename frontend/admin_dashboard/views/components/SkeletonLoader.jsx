"use client";

/**
 * SkeletonLoader — views/components/SkeletonLoader.jsx
 * Reusable animated pulse skeleton loading placeholders for tables and cards.
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
