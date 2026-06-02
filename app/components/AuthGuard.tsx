"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const publicPages = ["/", "/login", "/register", "/forgot-password", "/reset-password"];

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      if (publicPages.includes(pathname)) {
        setChecking(false);
        return;
      }

      const res = await fetch("/api/session");

      if (!active) return;

      if (!res.ok) {
        localStorage.removeItem("pathfinderLoggedIn");
        localStorage.removeItem("pathfinderUser");
        router.replace(res.status === 403 ? "/login?account=terminated" : "/login");
        return;
      }

      setChecking(false);
    }

    checkSession().catch(() => {
      if (!active) return;
      router.replace("/login");
    });

    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (checking) {
    return <div style={{ padding: 50 }}>Checking access...</div>;
  }

  return <>{children}</>;
}
