"use client";

import React from "react";

/**
 * PaginationBar — views/components/PaginationBar.jsx
 * A reusable pagination footer with page counter and ellipses.
 *
 * Props:
 *   currentPage  {number}   — current active page (1-based)
 *   totalPages   {number}   — total number of pages
 *   onPageChange {Function} — callback called with target page number
 *   totalItems   {number}   — total records/items count
 *   startIndex   {number}   — 0-based start index of page items
 *   endIndex     {number}   — 0-based end index of page items
 *   itemName     {string}   — name of the items (defaults to "users")
 */
export default function PaginationBar({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  startIndex,
  endIndex,
  itemName = "users",
}) {
  // Ellipsis pagination helper
  function getPageNumbers(current, total) {
    const list = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) list.push(i);
    } else {
      if (current <= 4) {
        list.push(1, 2, 3, 4, 5, "...", total);
      } else if (current >= total - 3) {
        list.push(1, "...", total - 4, total - 3, total - 2, total - 1, total);
      } else {
        list.push(1, "...", current - 1, current, current + 1, "...", total);
      }
    }
    return list;
  }

  if (totalItems === 0) return null;

  const counterText = `Showing ${startIndex + 1}-${endIndex} of ${totalItems} ${itemName}`;

  return (
    <div className="bg-white rounded-xl shadow-[0_8px_25px_rgba(226,232,240,0.75)] px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
      <span className="text-[#94a3b8] text-xs font-semibold">
        {counterText}
      </span>

      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          type="button"
          id="btn-prev-page"
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="px-3 py-1.5 text-xs font-semibold border border-[#e2e8f0] rounded-xl text-[#64748b] hover:border-[#1e3b8a] hover:text-[#1e3b8a] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-white"
        >
          Previous
        </button>

        {/* Page numbers */}
        {getPageNumbers(currentPage, totalPages).map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-xs font-semibold text-[#94a3b8]"
              >
                ...
              </span>
            );
          }
          const isActive = p === currentPage;
          return (
            <button
              key={`page-${p}`}
              type="button"
              id={`btn-page-${p}`}
              onClick={() => onPageChange(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer bg-white ${
                isActive
                  ? "bg-[#1e3b8a] border-[#1e3b8a] text-white shadow-[0_4px_12px_rgba(30,59,138,0.25)]"
                  : "border-[#e2e8f0] text-[#64748b] hover:border-[#1e3b8a] hover:text-[#1e3b8a]"
              }`}
            >
              {p}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          id="btn-next-page"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="px-3 py-1.5 text-xs font-semibold border border-[#e2e8f0] rounded-xl text-[#64748b] hover:border-[#1e3b8a] hover:text-[#1e3b8a] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-white"
        >
          Next
        </button>
      </div>
    </div>
  );
}
