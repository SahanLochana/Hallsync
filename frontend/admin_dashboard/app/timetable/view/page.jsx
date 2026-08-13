"use client";

import { Suspense } from "react";
import TimetableViewPage from "@/views/pages/timetable/TimetableViewPage";
import AuthGuard from "@/views/components/AuthGuard";
import { PageSkeleton } from "@/views/components/SkeletonLoader";

export default function TimetableViewRoute() {
  return (
    <AuthGuard>
      <Suspense fallback={<PageSkeleton />}>
        <TimetableViewPage />
      </Suspense>
    </AuthGuard>
  );
}
