/**
 * Next.js Route — /halls
 * Thin route file — only imports and renders the HallsPage view.
 *
 * MVC separation:
 *   Model      →  models/hallModel.js
 *   Controller →  controllers/hallController.js
 *   View       →  views/pages/halls/HallsPage.jsx  ← rendered here
 */

import HallsPage from "@/views/pages/halls/HallsPage";

export const metadata = {
  title: "HallSync — Hall Management",
  description: "Manage lecture halls and location information for HallSync.",
};

export default function HallsRoute() {
  return <HallsPage />;
}
