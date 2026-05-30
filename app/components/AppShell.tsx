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
        background: darkMode ? "#020617" : undefined,
        color: darkMode ? "white" : "#102033",
      }}
    >
      <Topbar />
      {children}
      <BottomNav />
    </div>
  );
}
