"use client";

import DepartmentPage from "@/views/pages/department/DepartmentPage";
import AuthGuard from "@/views/components/AuthGuard";

export default function DepartmentRoute() {
  return (
    <AuthGuard>
      <DepartmentPage />
    </AuthGuard>
  );
}
