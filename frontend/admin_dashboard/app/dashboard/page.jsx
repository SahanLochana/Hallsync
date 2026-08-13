"use client";

import HomePage from "@/views/pages/home/homePage";
import AuthGuard from "@/views/components/AuthGuard";

export default function DashboardRoute() {
  return (
    <AuthGuard>
      <HomePage />
    </AuthGuard>
  );
}
