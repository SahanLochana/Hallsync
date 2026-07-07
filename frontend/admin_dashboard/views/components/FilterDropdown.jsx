"use client";

import { ChevronDown } from "lucide-react";

/**
 * FilterDropdown — views/components/FilterDropdown.jsx
 * A reusable select dropdown with standardized styles for filters.
 *
 * Props:
 *   id                 {string}   — select element ID
 *   value              {string}   — active select value
 *   onChange           {Function} — callback called with selected option value
 *   options            {Array}    — option elements (array of strings or {value, label} objects)
 *   defaultOptionLabel {string}   — optional label for "All" option (defaults to value "All")
 */
export default function FilterDropdown({
  id,
  value,
  onChange,
  options = [],
  defaultOptionLabel,
  disabled,
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="appearance-none bg-[#f1f5f9] border border-[#e2e8f0] text-[#475569] font-medium text-sm
                   pl-3 pr-8 py-2.5 rounded-xl cursor-pointer focus:outline-none focus:ring-2
                   focus:ring-[#1e3b8a]/20 focus:border-[#1e3b8a] transition-all hover:bg-[#e2e8f0]/40
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        {defaultOptionLabel && (
          <option value="All">{defaultOptionLabel}</option>
        )}
        {options.map((opt) => {
          const val = typeof opt === "string" ? opt : opt.value;
          const label = typeof opt === "string" ? opt : opt.label;
          return (
            <option key={val} value={val}>
              {label}
            </option>
          );
        })}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none"
      />
    </div>
  );
}
