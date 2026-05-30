"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";
import AppShell from "./components/AppShell";
import AuthGuard from "./components/AuthGuard";
import ToastContainer from "./components/ToastContainer";
import { AppProvider } from "./context/AppContext";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isLandingPage =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname.startsWith("/pay/");

  return (
    <html lang="en">
      <body className="app-body">
        <AppProvider>

          {isLandingPage ? (
            children
          ) : (
            <AuthGuard>
              <Sidebar />
              <AppShell>
                {children}
              </AppShell>
            </AuthGuard>
          )}

          <ToastContainer />
        </AppProvider>
      </body>
    </html>
  );
}
