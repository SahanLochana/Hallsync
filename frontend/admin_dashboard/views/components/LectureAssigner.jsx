"use client";

/**
 * LectureAssigner — views/components/LectureAssigner.jsx
 * Interactive search & assign component for assigning lectures to Lecturers.
 * Formats items as: (lecture module code - title (semester))
 */

import { useState } from "react";
import { Search, BookOpen, X, Plus } from "lucide-react";

export default function LectureAssigner({
  assignedModuleIds = [],
  availableModules = [],
  onAddModule,
  onRemoveModule,
  disabled = false,
  isLoading = false,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const unassigned = availableModules.filter(
    (m) => !assignedModuleIds.includes(m.module_id)
  );

  const q = searchQuery.toLowerCase().trim();
  const filtered = unassigned.filter((m) => {
    if (!q) return true;
    const code = (m.module_id || m.courseCode || "").toLowerCase();
    const name = (m.name || m.courseTitle || "").toLowerCase();
    const sem = String(m.semester || "").toLowerCase();
    return code.includes(q) || name.includes(q) || sem.includes(q);
  });

  return (
    <div className="flex flex-col gap-2.5">
      {/* Selected lecture chips */}
      {assignedModuleIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl max-h-36 overflow-y-auto">
          {assignedModuleIds.map((modId) => {
            const modObj = availableModules.find(
              (m) => m.module_id === modId
            );
            const label = modObj
              ? `${modObj.module_id} - ${modObj.name} (${modObj.semester})`
              : modId;

            return (
              <span
                key={modId}
                className="inline-flex items-center gap-1.5 bg-[#1e3b8a] text-white text-xs px-2.5 py-1 rounded-lg shadow-sm font-medium"
              >
                <BookOpen size={12} className="shrink-0" />
                <span className="truncate max-w-[280px]">{label}</span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onRemoveModule(modId)}
                  className="hover:text-red-300 transition-colors ml-0.5 shrink-0"
                >
                  <X size={13} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Search Bar for available lectures */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
        />
        <input
          type="text"
          disabled={disabled || isLoading}
          placeholder={
            isLoading
              ? "Loading department lectures..."
              : "Search lecture by code, title, or semester..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-8 py-2 border border-[#e2e8f0] rounded-xl text-xs text-[#0f172a] bg-white placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#1e3b8a]/30 focus:border-[#1e3b8a] transition disabled:opacity-60"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#334155]"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Matching Lectures List */}
      <div className="border border-[#e2e8f0] rounded-xl bg-white max-h-48 overflow-y-auto divide-y divide-[#f1f5f9]">
        {isLoading ? (
          <div className="p-3 text-center text-xs text-[#94a3b8]">
            Loading available lectures from MongoDB...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-3 text-center text-xs text-[#94a3b8]">
            {unassigned.length === 0
              ? "All lectures assigned."
              : "No lectures match your search."}
          </div>
        ) : (
          filtered.map((m) => {
            const formattedItem = `${m.module_id} - ${m.name} (${m.semester})`;
            return (
              <div
                key={m.module_id}
                onClick={() => {
                  if (!disabled) {
                    onAddModule(m.module_id);
                    setSearchQuery("");
                  }
                }}
                className="px-3 py-2 flex items-center justify-between hover:bg-[#f8fafc] cursor-pointer transition-colors group text-xs"
              >
                <div className="flex items-center gap-2 overflow-hidden mr-2">
                  {m.departmentCode && (
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded shrink-0">
                      {m.departmentCode}
                    </span>
                  )}
                  <span className="font-medium text-[#0f172a] truncate">
                    {formattedItem}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={disabled}
                  className="text-[#1e3b8a] opacity-70 group-hover:opacity-100 flex items-center gap-0.5 font-semibold text-[11px] shrink-0 hover:underline"
                >
                  <Plus size={13} /> Assign
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
