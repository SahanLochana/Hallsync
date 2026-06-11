/**
 * Next.js Route — /users
 * Thin route file — only imports and renders the UsersPage view.
 *
 * MVC separation:
 *   Model      →  models/userModel.js
 *   Controller →  controllers/userController.js
 *   View       →  views/pages/users/UsersPage.jsx  ← rendered here
 */

import UsersPage from "@/views/pages/users/UsersPage";

export const metadata = {
  title: "HallSync — User Management",
  description: "Manage admin, lecturer, and student accounts for HallSync.",
};

export default function UsersRoute() {
  return <UsersPage />;
}
