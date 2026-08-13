"use client";

import UsersPage from "@/views/pages/users/UsersPage";
import AuthGuard from "@/views/components/AuthGuard";

export default function UsersRoute() {
  return (
    <AuthGuard>
      <UsersPage />
    </AuthGuard>
  );
}
