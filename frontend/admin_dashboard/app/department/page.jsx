/**
 * Next.js Route — /department
 * Thin route file rendering the DepartmentPage view.
 */

import DepartmentPage from "@/views/pages/department/DepartmentPage";

export const metadata = {
  title: "HallSync — Department Management",
  description: "View faculty departments, degree programs, and curriculum lectures.",
};

export default function DepartmentRoute() {
  return <DepartmentPage />;
}
