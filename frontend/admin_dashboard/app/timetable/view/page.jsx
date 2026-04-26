/**
 * Next.js Route — /timetable/view
 * Thin route: imports and renders TimetableViewPage.
 *
 * MVC separation:
 *   Model      →  models/timetableViewModel.js
 *   Controller →  controllers/timetableViewController.js
 *   View       →  views/pages/timetable/TimetableViewPage.jsx
 */

import TimetableViewPage from "@/views/pages/timetable/TimetableViewPage";

export default function TimetableViewRoute() {
  return <TimetableViewPage />;
}
