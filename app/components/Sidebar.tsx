"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  Menu,
  X,
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

const links = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { currentUser } = useAppContext();
  const visibleLinks =
    currentUser?.role === "Admin"
      ? [...links, { name: "Admin", href: "/admin", icon: ShieldCheck }]
      : links;

  return (
    <>
      <button className="mobile-menu-btn" onClick={() => setOpen(true)}>
        <Menu size={26} />
      </button>

      <aside className={open ? "sidebar mobile-open" : "sidebar"}>
        <div className="sidebar-header">
          <div className="brand">
            <Image src="/logo-pathpayx-brand.png" alt="PathPayX" width={170} height={64} />
          </div>

          <button className="close-btn" onClick={() => setOpen(false)}>
            <X size={26} />
          </button>
        </div>

        <nav className="sidebar-links">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const active =
              pathname === link.href ||
              (link.href === "/admin" && pathname.startsWith("/admin"));

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
          onClick={async () => {
            await fetch("/api/logout", {
              method: "POST",
            });
            localStorage.removeItem("pathfinderLoggedIn");
            localStorage.removeItem("pathfinderUser");
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
