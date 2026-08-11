"use client";

/**
 * Admin Dashboard Home Page — views/pages/home/homePage.jsx (MVC View)
 * Home page overview and quick-access dashboard for HallSync Admin.
 *
 * Components reused:
 *   - TopHeader       (views/components/TopHeader.jsx)
 *   - Sidebar         (views/components/Sidebar.jsx)
 *   - AddHallModal    (views/components/AddHallModal.jsx)
 *   - AddUserModal    (views/components/AddUserModal.jsx)
 *   - AddModuleModal  (views/components/AddModuleModal.jsx)
 *   - LoadingSpinner  (views/components/LoadingSpinner.jsx)
 */

import { useState, useEffect } from "react";
import { DoorOpen, UserPlus, BookOpen, Users, Building2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

import TopHeader from "@/views/components/TopHeader";
import Sidebar from "@/views/components/Sidebar";
import AddHallModal from "@/views/components/AddHallModal";
import AddUserModal from "@/views/components/AddUserModal";
import AddModuleModal from "@/views/components/AddModuleModal";
import LoadingSpinner from "@/views/components/LoadingSpinner";

import { INITIAL_STATS } from "@/models/homeModel";
import { fetchDashboardStats, addModule } from "@/controllers/homeController";
import { addHall } from "@/controllers/hallController";
import { addUser } from "@/controllers/userController";

// ── Quick Access Card Component ──────────────────────────────────────────────
function QuickAccessCard({ icon: Icon, title, description, onClick, id }) {
  return (
    <button
      id={id}
      onClick={onClick}
      className="bg-white rounded-xl shadow-[0_8px_25px_rgba(226,232,240,0.75)] p-5 border border-[#e2e8f0]/60
                 hover:border-[#1e3b8a]/40 hover:shadow-md transition-all duration-200 text-left
                 flex items-start gap-4 cursor-pointer group w-full"
    >
      <div className="w-12 h-12 rounded-xl bg-[#1e3b8a]/10 text-[#1e3b8a] flex items-center justify-center shrink-0
                      group-hover:bg-[#1e3b8a] group-hover:text-white transition-colors duration-200">
        <Icon size={22} strokeWidth={2.2} />
      </div>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-[#0f172a] font-bold text-base group-hover:text-[#1e3b8a] transition-colors">
            {title}
          </span>
          <ArrowRight size={16} className="text-[#94a3b8] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </div>
        <span className="text-[#64748b] text-xs leading-relaxed">
          {description}
        </span>
      </div>
    </button>
  );
}

// ── User Statistic Card Component ─────────────────────────────────────────────
function UserStatsCard({ totalUsers, lecturersCount, studentsCount, isLoading }) {
  return (
    <div className="bg-white rounded-xl shadow-[0_8px_25px_rgba(226,232,240,0.75)] p-6 border border-[#e2e8f0]/60 flex flex-col justify-between gap-5">
      <div className="flex items-center justify-between">
        <span className="text-[#64748b] font-semibold text-xs uppercase tracking-wider">
          Users
        </span>
        <div className="w-8 h-8 rounded-lg bg-[#1e3b8a]/10 text-[#1e3b8a] flex items-center justify-center">
          <Users size={18} strokeWidth={2.2} />
        </div>
      </div>

      {isLoading ? (
        <div className="py-4">
          <div className="h-10 w-24 bg-slate-200 animate-pulse rounded-lg mb-2" />
          <div className="h-4 w-20 bg-slate-100 animate-pulse rounded" />
        </div>
      ) : (
        <div>
          <div className="text-4xl font-extrabold text-[#0f172a] tracking-tight">
            {totalUsers.toLocaleString()}
          </div>
          <div className="text-[#64748b] text-xs font-medium mt-1">
            Total Users
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-[#f1f5f9] grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[#94a3b8] text-xs font-medium">Lecturers</span>
          <span className="text-[#334155] font-bold text-lg">
            {isLoading ? "—" : lecturersCount.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[#94a3b8] text-xs font-medium">Students</span>
          <span className="text-[#334155] font-bold text-lg">
            {isLoading ? "—" : studentsCount.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Hall Statistic Card Component ─────────────────────────────────────────────
function HallStatsCard({ totalHalls, availableHalls, unavailableHalls, isLoading }) {
  return (
    <div className="bg-white rounded-xl shadow-[0_8px_25px_rgba(226,232,240,0.75)] p-6 border border-[#e2e8f0]/60 flex flex-col justify-between gap-5">
      <div className="flex items-center justify-between">
        <span className="text-[#64748b] font-semibold text-xs uppercase tracking-wider">
          Halls
        </span>
        <div className="w-8 h-8 rounded-lg bg-[#1e3b8a]/10 text-[#1e3b8a] flex items-center justify-center">
          <Building2 size={18} strokeWidth={2.2} />
        </div>
      </div>

      {isLoading ? (
        <div className="py-4">
          <div className="h-10 w-24 bg-slate-200 animate-pulse rounded-lg mb-2" />
          <div className="h-4 w-20 bg-slate-100 animate-pulse rounded" />
        </div>
      ) : (
        <div>
          <div className="text-4xl font-extrabold text-[#0f172a] tracking-tight">
            {totalHalls.toLocaleString()}
          </div>
          <div className="text-[#64748b] text-xs font-medium mt-1">
            Total Halls
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-[#f1f5f9] grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-[#94a3b8] text-xs font-medium">
            <CheckCircle2 size={12} className="text-emerald-500" />
            <span>Available</span>
          </div>
          <span className="text-[#334155] font-bold text-lg">
            {isLoading ? "—" : availableHalls.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-[#94a3b8] text-xs font-medium">
            <XCircle size={12} className="text-red-500" />
            <span>Unavailable</span>
          </div>
          <span className="text-[#334155] font-bold text-lg">
            {isLoading ? "—" : unavailableHalls.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page View ────────────────────────────────────────────────────────────
export default function AdminHomePage() {
  const [stats, setStats] = useState(INITIAL_STATS);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // Modals visibility
  const [showAddHall, setShowAddHall] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddModule, setShowAddModule] = useState(false);

  // Load stats on mount
  useEffect(() => {
    fetchDashboardStats(setStats, setIsLoadingStats, setStatsError);
  }, []);

  // Handlers for modal submits
  async function handleAddHall(form) {
    await addHall([], form, () => {});
    setShowAddHall(false);
    fetchDashboardStats(setStats, setIsLoadingStats, setStatsError);
  }

  async function handleAddUser(form) {
    await addUser([], form, () => {});
    setShowAddUser(false);
    fetchDashboardStats(setStats, setIsLoadingStats, setStatsError);
  }

  async function handleAddModule(form) {
    await addModule(form);
    setShowAddModule(false);
  }

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] overflow-hidden">
      {/* ── TOP HEADER ────────────────────────────────────────────────────── */}
      <TopHeader title="Dashboard" />

      {/* ── BODY — SIDEBAR + MAIN CONTENT ─────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto no-scrollbar">
          {/* ── 1. PAGE HEADER ────────────────────────────────────────────── */}
          <div className="flex flex-col gap-1">
            <h1 className="text-[#0f172a] font-bold text-2xl tracking-tight">
              Welcome back, Admin 👋
            </h1>
            <p className="text-[#64748b] text-sm font-medium">
              Here&apos;s what&apos;s happening in HallSync.
            </p>
          </div>

          {statsError && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              {statsError}
            </div>
          )}

          {/* ── 2. QUICK ACCESS ───────────────────────────────────────────── */}
          <section className="flex flex-col gap-3">
            <h2 className="text-[#334155] font-bold text-xs uppercase tracking-wider">
              Quick Access
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QuickAccessCard
                id="quick-access-create-hall"
                icon={DoorOpen}
                title="Create Hall"
                description="Add a new lecture hall"
                onClick={() => setShowAddHall(true)}
              />
              <QuickAccessCard
                id="quick-access-create-user"
                icon={UserPlus}
                title="Create User"
                description="Add a student or lecturer"
                onClick={() => setShowAddUser(true)}
              />
              <QuickAccessCard
                id="quick-access-create-module"
                icon={BookOpen}
                title="Create Module"
                description="Add a new academic module"
                onClick={() => setShowAddModule(true)}
              />
            </div>
          </section>

          {/* ── 3. STATISTICS ─────────────────────────────────────────────── */}
          <section className="flex flex-col gap-3">
            <h2 className="text-[#334155] font-bold text-xs uppercase tracking-wider">
              Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UserStatsCard
                totalUsers={stats.totalUsers}
                lecturersCount={stats.lecturersCount}
                studentsCount={stats.studentsCount}
                isLoading={isLoadingStats}
              />
              <HallStatsCard
                totalHalls={stats.totalHalls}
                availableHalls={stats.availableHalls}
                unavailableHalls={stats.unavailableHalls}
                isLoading={isLoadingStats}
              />
            </div>
          </section>
        </main>
      </div>

      {/* ── MODALS ────────────────────────────────────────────────────────── */}
      <AddHallModal
        isOpen={showAddHall}
        onClose={() => setShowAddHall(false)}
        onConfirm={handleAddHall}
      />

      <AddUserModal
        isOpen={showAddUser}
        onClose={() => setShowAddUser(false)}
        onConfirm={handleAddUser}
      />

      <AddModuleModal
        isOpen={showAddModule}
        onClose={() => setShowAddModule(false)}
        onConfirm={handleAddModule}
      />
    </div>
  );
}