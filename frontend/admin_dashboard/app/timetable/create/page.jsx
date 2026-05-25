/**
 * Next.js Route — /timetable/create
 * Thin route file — only imports and renders the TimetableCreatePage view.
 *
 * MVC separation:
 *   Model      →  models/timetableCreateModel.js
 *   Controller →  controllers/timetableCreateController.js
 *   View       →  views/pages/timetable/TimetableCreatePage.jsx  ← rendered here
 */

import TimetableCreatePage from "@/views/pages/timetable/TimetableCreatePage";

export default function TimetableCreateRoute() {
  return <TimetableCreatePage />;
}
