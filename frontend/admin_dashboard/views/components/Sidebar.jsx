"use client";

/**
 * Sidebar Component — views/components/Sidebar.jsx
 * Left-side navigation drawer shared by all dashboard pages.
 * Add new nav items to the NAV_ITEMS array below.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  DoorOpen,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

// ── Navigation items — extend this array for new pages ──────────────────────
const NAV_ITEMS = [
  { label: "Dashboard",  href: "/dashboard",  icon: LayoutDashboard },
  { label: "Timetable",  href: "/timetable",  icon: CalendarDays },
  { label: "Halls",      href: "/halls",       icon: DoorOpen },
  { label: "Users",      href: "/users",       icon: Users },
  { label: "Settings",   href: "/settings",    icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-white flex flex-col items-center py-6 px-2.5 gap-2 shadow-[8px_0px_25px_0px_rgba(226,232,240,0.75)] shrink-0 h-full">

      {/* Nav items */}
      <nav className="flex flex-col items-center gap-1 flex-1 pt-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`
                flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all group
                ${isActive
                  ? "bg-[#1e3b8a] text-white shadow-[0_4px_12px_rgba(30,59,138,0.25)]"
                  : "text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#1e3b8a]"}
              `}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {/* Tooltip label on hover */}
              <span className="absolute left-[76px] bg-[#0f172a] text-white text-xs font-medium px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout button at bottom */}
      <button
        id="btn-sidebar-logout"
        title="Logout"
        onClick={() => {/* TODO: handleLogout — clear session and redirect to /login */}}
        className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl text-[#94a3b8] hover:bg-red-50 hover:text-red-500 transition-all group relative"
      >
        <LogOut size={20} strokeWidth={2} />
        <span className="absolute left-[76px] bg-[#0f172a] text-white text-xs font-medium px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
          Logout
        </span>
      </button>
    </aside>
  );
}
