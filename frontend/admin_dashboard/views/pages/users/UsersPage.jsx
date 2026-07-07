"use client";

/**
 * Users Page View — views/pages/users/UsersPage.jsx (MVC)
 * Pure UI layer for the user management page.
 * Business logic is in userController.js.
 * Data shape is in userModel.js.
 *
 * Reusable components used:
 *   - TopHeader       (views/components/TopHeader.jsx)
 *   - Sidebar         (views/components/Sidebar.jsx)
 *   - AddUserModal    (views/components/AddUserModal.jsx)
 *   - UserDetailModal (views/components/UserDetailModal.jsx)
 *   - ImportCsvModal  (views/components/ImportCsvModal.jsx)
 */

import { useState, useEffect, useMemo, memo } from "react";
import { Plus, Upload, Search, X, Eye, ChevronDown, UserX } from "lucide-react";

import TopHeader from "@/views/components/TopHeader";
import Sidebar from "@/views/components/Sidebar";
import AddUserModal from "@/views/components/AddUserModal";
import UserDetailModal from "@/views/components/UserDetailModal";
import ImportCsvModal from "@/views/components/ImportCsvModal";
import LoadingSpinner from "@/views/components/LoadingSpinner";
import FilterDropdown from "@/views/components/FilterDropdown";
import PaginationBar from "@/views/components/PaginationBar";

import { ROLE_OPTIONS } from "@/models/userModel";
import {
  fetchUsers,
  filterUsers,
  addUser,
  editUser,
} from "@/controllers/userController";

// ── Role badge colours ─────────────────────────────────────────────────────────
const ROLE_BADGE = {
  Lecturer: "bg-purple-100 text-purple-700",
  Student: "bg-sky-100 text-sky-700",
};

// ── Small role badge ───────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_BADGE[role] ?? "bg-gray-100 text-gray-600"}`}
    >
      {role}
    </span>
  );
}

// ── User table row ────────────────────────────────────────────────────────────
const UserRow = memo(function UserRow({ user, onView }) {
  return (
    <tr className="border-b border-[#94a3b8]/20 hover:bg-[#f8fafc] transition-colors group">
      <td className="py-4 pl-5 pr-3 font-mono text-sm text-[#334155] font-medium whitespace-nowrap">
        {user.universityId}
      </td>
      <td className="py-4 px-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[#0f172a] font-semibold text-sm group-hover:text-[#1e3b8a] transition-colors">
            {user.name}
          </span>
          <span className="text-[#94a3b8] text-xs">{user.email}</span>
        </div>
      </td>
      <td className="py-4 px-3">
        <RoleBadge role={user.role} />
      </td>
      <td className="py-4 pl-3 pr-5 text-right">
        <button
          id={`btn-view-user-${user.id}`}
          onClick={() => onView(user)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e2e8f0]
                     text-[#64748b] text-xs font-semibold
                     hover:border-[#1e3b8a] hover:text-[#1e3b8a] hover:bg-[#1e3b8a]/5
                     transition-all cursor-pointer"
        >
          <Eye size={12} strokeWidth={2.5} />
          View
        </button>
      </td>
    </tr>
  );
});

// ── Table row skeleton loader ──────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-[#94a3b8]/10 animate-pulse">
      <td className="py-4 pl-5 pr-3">
        <div className="h-4 bg-slate-200 rounded w-24" />
      </td>
      <td className="py-4 px-3">
        <div className="flex flex-col gap-2">
          <div className="h-4 bg-slate-200 rounded w-40" />
          <div className="h-3 bg-slate-100 rounded w-28" />
        </div>
      </td>
      <td className="py-4 px-3">
        <div className="h-5 bg-slate-200 rounded-full w-16" />
      </td>
      <td className="py-4 pl-3 pr-5 text-right">
        <div className="h-7 bg-slate-200 rounded-lg w-16 ml-auto" />
      </td>
    </tr>
  );
}

// Reusable FilterDropdown is imported from @/views/components/FilterDropdown

// ── Main View ─────────────────────────────────────────────────────────────────
export default function UsersPage() {
  // ── State ────────────────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Draft filter states (bound to UI controls)
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");

  // Active filter states (applied on Search button click)
  const [activeSearch, setActiveSearch] = useState("");
  const [activeRole, setActiveRole] = useState("All");
  const [activeYear, setActiveYear] = useState("All");
  const [activeDept, setActiveDept] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [viewTarget, setViewTarget] = useState(null); // user object to view/edit

  // ── Load on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    fetchUsers(setUsers, setIsLoading, setError);
  }, []);

  // Compute departments dynamically from fetched users
  const departments = useMemo(() => {
    return [
      ...new Set(users.map((u) => u.department).filter(Boolean)),
    ].sort();
  }, [users]);

  // ── Filtered list ────────────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    return filterUsers(
      users,
      activeSearch,
      activeRole,
      activeYear,
      activeDept,
    );
  }, [users, activeSearch, activeRole, activeYear, activeDept]);

  // Total pages calculation
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  // Reset year filter if Lecturer is selected
  useEffect(() => {
    if (roleFilter === "Lecturer") {
      setYearFilter("All");
    }
  }, [roleFilter]);

  // Safe page correction if filters change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredUsers.length, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredUsers.length);

  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, startIndex, endIndex]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  async function handleAddUser(form) {
    await addUser(users, form, setUsers);
    setShowAdd(false);
  }

  async function handleEditUser(updatedUser) {
    await editUser(users, updatedUser, setUsers);
    setViewTarget(null);
  }

  async function handleImport(successUsers) {
    if (successUsers && successUsers.length > 0) {
      setUsers((prev) => [...successUsers, ...prev]);
    }
    setShowImport(false);
  }

  function handleSearchApply(e) {
    if (e) e.preventDefault();
    setActiveSearch(search);
    setActiveRole(roleFilter);
    setActiveYear(yearFilter);
    setActiveDept(deptFilter);
    setCurrentPage(1);
  }

  function handleClearSearch() {
    setSearch("");
    setActiveSearch("");
    setCurrentPage(1);
  }

  function handleResetFilters() {
    setSearch("");
    setRoleFilter("All");
    setYearFilter("All");
    setDeptFilter("All");

    setActiveSearch("");
    setActiveRole("All");
    setActiveYear("All");
    setActiveDept("All");

    setCurrentPage(1);
  }

  // Pagination helpers are handled by PaginationBar component

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-[#f8fafc]">
      {/* ── TOP HEADER ─────────────────────────────────────────────────────── */}
      <TopHeader
        title="User Management"
        actions={
          <>
            <button
              id="btn-import-csv"
              onClick={() => setShowImport(true)}
              className="flex items-center gap-1.5 px-4 h-10 rounded-2xl border border-[#e2e8f0]
                         text-[#334155] font-semibold text-sm bg-white
                         hover:bg-[#f8fafc] hover:border-[#1e3b8a]/40 transition-all"
            >
              <Upload size={15} strokeWidth={2.5} />
              Import CSV/Excel
            </button>
            <button
              id="btn-add-user"
              onClick={() => setShowAdd(true)}
              className="bg-[#1e3b8a] text-white font-semibold text-sm
                         flex items-center gap-1.5 px-4 h-10 rounded-2xl
                         hover:bg-[#162d6b] active:scale-[0.98] transition-all
                         shadow-[0_4px_12px_rgba(30,59,138,0.25)]"
            >
              <Plus size={15} strokeWidth={2.5} />
              Add User
            </button>
          </>
        }
      />

      {/* ── BODY — SIDEBAR + CONTENT ────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (shared component) */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 p-5 flex flex-col gap-5 overflow-hidden">
          {/* ── SEARCH & FILTER BAR ──────────────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-[0_8px_25px_rgba(226,232,240,0.75)] px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
            <form
              onSubmit={handleSearchApply}
              className="flex items-center gap-3 flex-wrap flex-1 max-w-4xl"
            >
              {/* Search input */}
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none"
                />
                <input
                  id="search-users"
                  type="text"
                  placeholder="Search by ID or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-[#f1f5f9] text-sm text-[#0f172a]
                             placeholder:text-[#94a3b8] border border-transparent focus:outline-none focus:ring-2
                             focus:ring-[#1e3b8a]/20 focus:border-[#1e3b8a] transition"
                />
                {search && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Role filter */}
              <FilterDropdown
                id="filter-user-role"
                value={roleFilter}
                onChange={setRoleFilter}
                options={[
                  { value: "Student", label: "Student" },
                  { value: "Lecturer", label: "Lecturer" }
                ]}
                defaultOptionLabel="All Roles"
              />

              {/* Year filter */}
              <FilterDropdown
                id="filter-user-year"
                value={yearFilter}
                onChange={setYearFilter}
                options={["1st Year", "2nd Year", "3rd Year", "4th Year"]}
                defaultOptionLabel="All Years"
                disabled={roleFilter === "Lecturer"}
              />

              {/* Dept filter */}
              <FilterDropdown
                id="filter-user-dept"
                value={deptFilter}
                onChange={setDeptFilter}
                options={departments}
                defaultOptionLabel="All Departments"
              />

              {/* Search button */}
              <button
                type="submit"
                id="btn-search-users-submit"
                className="bg-[#1e3b8a] text-white font-semibold text-sm flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl hover:bg-[#162d6b] active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(30,59,138,0.2)] cursor-pointer"
              >
                <Search size={14} strokeWidth={2.5} />
                Search
              </button>
            </form>

            {/* Result count */}
            <span className="text-[#94a3b8] text-xs font-semibold whitespace-nowrap hidden sm:block">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}{" "}
              found
            </span>
          </div>

          {/* ── USER TABLE ───────────────────────────────────────────────────── */}
          <div className="bg-white flex-1 rounded-xl shadow-[0_8px_25px_rgba(226,232,240,0.75)] overflow-auto">
            {/* Error state */}
            {error && (
              <div className="p-4 text-red-600 text-sm bg-red-50 border-b border-red-100">
                {error}
              </div>
            )}

            <table className="w-full text-left border-collapse">
              {/* Table header */}
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-[#94a3b8]/20">
                  <th className="py-3 pl-5 pr-3 text-[rgba(0,0,0,0.5)] font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                    University ID
                  </th>
                  <th className="py-3 px-3 text-[rgba(0,0,0,0.5)] font-semibold text-xs uppercase tracking-wide">
                    Name
                  </th>
                  <th className="py-3 px-3 text-[rgba(0,0,0,0.5)] font-semibold text-xs uppercase tracking-wide">
                    Role
                  </th>
                  <th className="py-3 pl-3 pr-5 text-[rgba(0,0,0,0.5)] font-semibold text-xs uppercase tracking-wide text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* Table body */}
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={`skeleton-${i}`} />
                  ))
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-16 text-center text-[#94a3b8] text-sm"
                    >
                      <div className="flex flex-col items-center justify-center gap-3">
                        <UserX size={36} className="text-[#cbd5e1] animate-bounce" />
                        <span className="font-semibold text-slate-700">No users match your search</span>
                        <span className="text-xs text-slate-400 max-w-[240px] leading-relaxed mx-auto">
                          Try adjusting your search keywords, role filters, or department filters to see matches.
                        </span>
                        {(activeSearch || activeRole !== "All" || activeYear !== "All" || activeDept !== "All") && (
                          <button
                            onClick={handleResetFilters}
                            type="button"
                            className="mt-2 px-4 py-2 rounded-xl bg-[#1e3b8a] hover:bg-[#162d6b] text-white text-xs font-semibold transition-all shadow-[0_4px_12px_rgba(30,59,138,0.2)] cursor-pointer"
                          >
                            Reset Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onView={setViewTarget}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── PAGINATION BAR ──────────────────────────────────────────────── */}
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredUsers.length}
            startIndex={startIndex}
            endIndex={endIndex}
            itemName="users"
          />
        </main>
      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────────── */}
      <AddUserModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onConfirm={handleAddUser}
      />

      <UserDetailModal
        isOpen={!!viewTarget}
        user={viewTarget}
        onClose={() => setViewTarget(null)}
        onSaveEdit={handleEditUser}
      />

      <ImportCsvModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
      />
    </div>
  );
}
