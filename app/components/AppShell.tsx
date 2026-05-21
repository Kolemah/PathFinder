"use client";

import Topbar from "./Topbar";
import { useAppContext } from "../context/AppContext";
import BottomNav from "./BottomNav";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { darkMode } = useAppContext();

  return (
    <div
    className="app-main"
      style={{
        background: darkMode ? "#020617" : "#f1f5f9",
        color: darkMode ? "white" : "#0f172a",
      }}
    >
      <Topbar />
      {children}
      <BottomNav />
    </div>
  );
}