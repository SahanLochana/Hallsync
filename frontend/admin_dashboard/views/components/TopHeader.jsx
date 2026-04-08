"use client";

/**
 * TopHeader Component — views/components/TopHeader.jsx
 * Shared top navigation bar for all dashboard pages.
 * Accepts an optional `actions` slot for page-specific buttons.
 *
 * Props:
 *   actions — ReactNode — optional right-side content (buttons, etc.)
 */

import { Landmark } from "lucide-react";

export default function TopHeader({ actions }) {
  return (
    <header className="bg-white border-b border-[#e2e8f0] flex items-center justify-between px-10 py-3 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="bg-[#1e3b8a] w-10 h-10 rounded-2xl flex items-center justify-center shrink-0">
          <Landmark size={20} color="white" strokeWidth={2} />
        </div>
        <span className="text-[#0f172a] font-bold text-[18px] tracking-tight">HallSync</span>
      </div>

      {/* Right-side slot — pass page-specific buttons here */}
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  );
}
