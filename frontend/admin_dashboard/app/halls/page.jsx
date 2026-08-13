"use client";

import HallsPage from "@/views/pages/halls/HallsPage";
import AuthGuard from "@/views/components/AuthGuard";

export default function HallsRoute() {
  return (
    <AuthGuard>
      <HallsPage />
    </AuthGuard>
  );
}
