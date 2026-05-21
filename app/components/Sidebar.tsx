"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  Menu,
  X,
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  FileText,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

const links = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="mobile-menu-btn" onClick={() => setOpen(true)}>
        <Menu size={26} />
      </button>

      <aside className={open ? "sidebar mobile-open" : "sidebar"}>
        <div className="sidebar-header">
          <div className="brand">
            <img src="/logo.png" alt="PathFinder" />
          </div>

          <button className="close-btn" onClick={() => setOpen(false)}>
            <X size={26} />
          </button>
        </div>

        <nav className="sidebar-links">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={active ? "sidebar-link active" : "sidebar-link"}
              >
                <Icon size={20} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <button
          className="sidebar-logout"
          onClick={() => {
            localStorage.removeItem("pathfinderLoggedIn");
            window.location.href = "/login";
          }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>
    </>
  );
}