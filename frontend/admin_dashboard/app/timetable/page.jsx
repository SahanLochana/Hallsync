/**
 * Next.js Route — /timetable
 * Thin route file — only imports and renders the TimetablePage view.
 *
 * MVC separation:
 *   Model      →  models/timetableModel.js
 *   Controller →  controllers/timetableController.js
 *   View       →  views/pages/timetable/TimetablePage.jsx  ← rendered here
 */

import TimetablePage from "@/views/pages/timetable/TimetablePage";

export default function TimetableRoute() {
  return <TimetablePage />;
}
