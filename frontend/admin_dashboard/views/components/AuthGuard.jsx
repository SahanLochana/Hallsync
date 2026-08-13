"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { verifyAdminSession } from "@/controllers/authController";
import { PageSkeleton } from "@/views/components/SkeletonLoader";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      const valid = await verifyAdminSession();
      if (!isMounted) return;
      if (valid) {
        setIsAuthenticated(true);
      } else {
        router.push("/login");
      }
      setChecking(false);
    }

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router]);

  if (checking) {
    return <PageSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
