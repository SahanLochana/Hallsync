"use client";

/**
 * Halls Page View — views/pages/halls/HallsPage.jsx (MVC)
 * Pure UI layer for the Hall Management page.
 * Business logic is in hallController.js.
 * Data shape is in hallModel.js.
 *
 * Reusable components used:
 *   - TopHeader        (views/components/TopHeader.jsx)
 *   - Sidebar          (views/components/Sidebar.jsx)
 *   - PageHeader       (views/components/PageHeader.jsx)
 *   - TableSkeleton    (views/components/SkeletonLoader.jsx)
 *   - FilterDropdown   (views/components/FilterDropdown.jsx)
 *   - AddHallModal     (views/components/AddHallModal.jsx)
 *   - ManageHallModal  (views/components/ManageHallModal.jsx)
 */

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  X,
  Settings2,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DoorOpen,
} from "lucide-react";

import TopHeader from "@/views/components/TopHeader";
import Sidebar from "@/views/components/Sidebar";
import PageHeader from "@/views/components/PageHeader";
import { TableSkeleton } from "@/views/components/SkeletonLoader";
import FilterDropdown from "@/views/components/FilterDropdown";
import AddHallModal from "@/views/components/AddHallModal";
import ManageHallModal from "@/views/components/ManageHallModal";

import { AVAILABILITY_OPTIONS } from "@/models/hallModel";
import {
  fetchHalls,
  filterHalls,
  addHall,
  editHall,
  removeHall,
} from "@/controllers/hallController";

// ── Availability badge ─────────────────────────────────────────────────────────
function AvailabilityBadge({ available }) {
  return available ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
      <CheckCircle2 size={11} strokeWidth={2.5} />
      Available
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
      <XCircle size={11} strokeWidth={2.5} />
      Unavailable
    </span>
  );
}

// ── Location status badge ──────────────────────────────────────────────────────
function LocationBadge({ latitude, longitude }) {
  const configured =
    latitude !== null &&
    latitude !== undefined &&
    longitude !== null &&
    longitude !== undefined;

  return configured ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">
      <MapPin size={11} strokeWidth={2.5} />
      Configured
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
      <AlertCircle size={11} strokeWidth={2.5} />
      Missing
    </span>
  );
}

// ── Hall table row ─────────────────────────────────────────────────────────────
function HallRow({ hall, onManage }) {
  return (
    <tr className="border-b border-[#94a3b8]/20 hover:bg-[#f8fafc] transition-colors group">
      {/* Hall ID */}
      <td className="py-4 pl-5 pr-3 font-mono text-sm text-[#334155] font-medium whitespace-nowrap">
        {hall.hallId}
      </td>

      {/* Hall Name */}
      <td className="py-4 px-3">
        <span className="text-[#0f172a] font-semibold text-sm group-hover:text-[#1e3b8a] transition-colors">
          {hall.name}
        </span>
      </td>

      {/* Availability */}
      <td className="py-4 px-3">
        <AvailabilityBadge available={hall.availability} />
      </td>

      {/* Capacity */}
      <td className="py-4 px-3 text-[#334155] text-sm font-medium">
        {hall.capacity.toLocaleString()}
      </td>

      {/* Location Status */}
      <td className="py-4 px-3">
        <LocationBadge latitude={hall.latitude} longitude={hall.longitude} />
      </td>

      {/* Actions */}
      <td className="py-4 pl-3 pr-5 text-right">
        <button
          id={`btn-manage-hall-${hall.hallId}`}
          onClick={() => onManage(hall)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e2e8f0]
                     text-[#64748b] text-xs font-semibold
                     hover:border-[#1e3b8a] hover:text-[#1e3b8a] hover:bg-[#1e3b8a]/5
                     transition-all"
        >
          <Settings2 size={12} strokeWidth={2.5} />
          Manage
        </button>
      </td>
    </tr>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyState({ isFiltered }) {
  return (
    <tr>
      <td colSpan={6} className="py-20 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#f1f5f9] flex items-center justify-center">
            <Settings2 size={24} className="text-[#94a3b8]" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[#334155] font-semibold text-sm">
              {isFiltered ? "No halls match your search" : "No halls found"}
            </span>
            <span className="text-[#94a3b8] text-xs">
              {isFiltered
                ? "Try adjusting your search or filters."
                : "Add your first hall using the button above."}
            </span>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────
export default function HallsPage() {
  // ── State ────────────────────────────────────────────────────────────────
  const [halls, setHalls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState("All");

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [manageTarget, setManageTarget] = useState(null); // hall object

  // Action feedback
  const [actionError, setActionError] = useState(null);

  // ── Load on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    fetchHalls(setHalls, setIsLoading, setError);
  }, []);

  // ── Filtered list ────────────────────────────────────────────────────────
  const filteredHalls = filterHalls(halls, search, availability);

  const isFiltered = search.trim() !== "" || availability !== "All";

  // ── Handlers ─────────────────────────────────────────────────────────────
  async function handleAddHall(form) {
    setActionError(null);
    try {
      await addHall(halls, form, setHalls);
      setShowAdd(false);
    } catch (err) {
      throw err;
    }
  }

  async function handleSaveHall(hallId, updateForm) {
    setActionError(null);
    try {
      const updated = await editHall(halls, hallId, updateForm, setHalls);
      setManageTarget(updated);
    } catch (err) {
      throw err;
    }
  }

  async function handleRemoveHall(hallId) {
    setActionError(null);
    try {
      await removeHall(halls, hallId, setHalls);
      setManageTarget(null);
    } catch (err) {
      throw err;
    }
  }

  function handleClearFilters() {
    setSearch("");
    setAvailability("All");
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-[#f8fafc]">
      {/* ── TOP HEADER ──────────────────────────────────────────────────── */}
      <TopHeader
        title="Hall Management"
        actions={
          <button
            id="btn-add-hall"
            onClick={() => {
              setActionError(null);
              setShowAdd(true);
            }}
            className="bg-[#1e3b8a] text-white font-semibold text-sm
                       flex items-center gap-1.5 px-4 h-10 rounded-2xl
                       hover:bg-[#162d6b] active:scale-[0.98] transition-all
                       shadow-[0_4px_12px_rgba(30,59,138,0.25)]"
          >
            <Plus size={15} strokeWidth={2.5} />
            Add Hall
          </button>
        }
      />

      {/* ── BODY — SIDEBAR + CONTENT ─────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
          {/* ── Page heading ─────────────────────────────────────────────── */}
          <PageHeader
            icon={DoorOpen}
            title="Hall Management"
            subtitle="Manage lecture halls and location information"
          />

          {/* ── Action error banner ───────────────────────────────────────── */}
          {actionError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm flex items-center justify-between gap-3">
              <span>{actionError}</span>
              <button
                onClick={() => setActionError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* ── SEARCH & FILTER BAR ───────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-[0_8px_25px_rgba(226,232,240,0.75)] px-5 py-3 flex items-center gap-4">
            {/* Search input */}
            <div className="relative flex-1 max-w-sm">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none"
              />
              <input
                id="search-halls"
                type="text"
                placeholder="Search by Hall ID or Hall Name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#f1f5f9] text-xs text-[#0f172a]
                           placeholder:text-[#94a3b8] focus:outline-none focus:ring-2
                           focus:ring-[#1e3b8a]/30 transition"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Availability filter */}
            <FilterDropdown
              id="filter-hall-availability"
              value={availability}
              onChange={setAvailability}
              options={AVAILABILITY_OPTIONS}
              defaultOptionLabel="All Halls"
            />

            {/* Clear filters */}
            {isFiltered && (
              <button
                id="btn-clear-hall-filters"
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[#64748b] text-xs font-semibold
                           hover:bg-[#f1f5f9] hover:text-[#334155] transition-colors"
              >
                <X size={14} strokeWidth={2.5} />
                Clear Filters
              </button>
            )}

            {/* Result count */}
            <span className="ml-auto text-[#94a3b8] text-xs font-medium hidden sm:block whitespace-nowrap">
              {filteredHalls.length} hall{filteredHalls.length !== 1 ? "s" : ""}{" "}
              found
            </span>
          </div>

          {/* ── HALL TABLE ────────────────────────────────────────────────── */}
          <div className="bg-white flex-1 rounded-2xl shadow-[0_8px_25px_rgba(226,232,240,0.75)] overflow-auto">
            {/* Load error */}
            {error && (
              <div className="p-4 text-red-600 text-sm bg-red-50 border-b border-red-100">
                {error}
              </div>
            )}

            {/* Loading state */}
            {isLoading ? (
              <TableSkeleton columns={6} rows={5} />
            ) : (
              <table className="w-full text-left border-collapse">
                {/* Table header */}
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-[#94a3b8]/20">
                    <th className="py-3 pl-5 pr-3 text-[#94a3b8] text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
                      Hall ID
                    </th>
                    <th className="py-3 px-3 text-[#94a3b8] text-[11px] font-bold uppercase tracking-wider">
                      Hall Name
                    </th>
                    <th className="py-3 px-3 text-[#94a3b8] text-[11px] font-bold uppercase tracking-wider">
                      Availability
                    </th>
                    <th className="py-3 px-3 text-[#94a3b8] text-[11px] font-bold uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="py-3 px-3 text-[#94a3b8] text-[11px] font-bold uppercase tracking-wider">
                      Location Status
                    </th>
                    <th className="py-3 pl-3 pr-5 text-[#94a3b8] text-[11px] font-bold uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                {/* Table body */}
                <tbody>
                  {filteredHalls.length === 0 ? (
                    <EmptyState isFiltered={isFiltered} />
                  ) : (
                    filteredHalls.map((hall) => (
                      <HallRow
                        key={hall.hallId}
                        hall={hall}
                        onManage={setManageTarget}
                      />
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────────── */}
      <AddHallModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onConfirm={handleAddHall}
      />

      <ManageHallModal
        isOpen={!!manageTarget}
        hall={manageTarget}
        onClose={() => setManageTarget(null)}
        onSave={handleSaveHall}
        onRemove={handleRemoveHall}
      />
    </div>
  );
}
