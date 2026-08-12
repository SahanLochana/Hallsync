"use client";

import TimetablePage from "@/views/pages/timetable/TimetablePage";
import AuthGuard from "@/views/components/AuthGuard";

export default function TimetableRoute() {
  return (
    <AuthGuard>
      <TimetablePage />
    </AuthGuard>
  );
}
