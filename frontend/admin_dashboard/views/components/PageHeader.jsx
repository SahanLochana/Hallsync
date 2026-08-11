"use client";

/**
 * PageHeader — views/components/PageHeader.jsx
 * Standardized page title header for admin dashboard pages.
 *
 * Props:
 *   icon     {React.Component} — Lucide icon component
 *   title    {string}          — Main page heading title
 *   subtitle {string}          — Optional descriptive subtext
 */

export default function PageHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className="text-[#1e3b8a]" size={24} strokeWidth={2.2} />}
        <h1 className="text-[#0f172a] font-bold text-2xl tracking-tight">
          {title}
        </h1>
      </div>
      {subtitle && (
        <p className="text-[#64748b] text-sm font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
}
