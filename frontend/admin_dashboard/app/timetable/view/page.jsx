/**
 * Next.js Route — /timetable/view
 * Thin route: imports and renders TimetableViewPage.
 *
 * MVC separation:
 *   Model      →  models/timetableViewModel.js
 *   Controller →  controllers/timetableViewController.js
 *   View       →  views/pages/timetable/TimetableViewPage.jsx
 */

import { Suspense } from "react";
import TimetableViewPage from "@/views/pages/timetable/TimetableViewPage";

export default function TimetableViewRoute() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-slate-500">Loading...</div>}>
      <TimetableViewPage />
    </Suspense>
  );
}
