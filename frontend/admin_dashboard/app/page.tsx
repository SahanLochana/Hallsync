/**
 * Root page — Redirects to the login page.
 */

import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
}
