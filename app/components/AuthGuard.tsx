"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  const publicPages = ["/", "/login", "/register"];

  useEffect(() => {
    const loggedIn = localStorage.getItem("pathfinderLoggedIn");

    if (publicPages.includes(pathname)) {
      setChecking(false);
      return;
    }

    if (loggedIn !== "true") {
      router.replace("/login");
      return;
    }

    setChecking(false);
  }, [pathname, router]);

  if (checking) {
    return <div style={{ padding: 50 }}>Checking access...</div>;
  }

  return <>{children}</>;
}