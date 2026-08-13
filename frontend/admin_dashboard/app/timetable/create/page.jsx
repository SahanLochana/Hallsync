"use client";

import TimetableCreatePage from "@/views/pages/timetable/TimetableCreatePage";
import AuthGuard from "@/views/components/AuthGuard";

export default function TimetableCreateRoute() {
  return (
    <AuthGuard>
      <TimetableCreatePage />
    </AuthGuard>
  );
}
