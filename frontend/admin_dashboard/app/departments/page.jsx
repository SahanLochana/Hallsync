"use client";

import DepartmentPage from "@/views/pages/department/DepartmentPage";
import AuthGuard from "@/views/components/AuthGuard";

export default function DepartmentsRoute() {
  return (
    <AuthGuard>
      <DepartmentPage />
    </AuthGuard>
  );
}
