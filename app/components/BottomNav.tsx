"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, ArrowLeftRight, Settings } from "lucide-react";

const links = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="bottom-nav">
      {links.map((link) => {
        const Icon = link.icon;
        const active = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className="bottom-nav-link"
            style={{
              color: active ? "#2563eb" : "#64748b",
              textDecoration: "none",
            }}
          >
            <Icon size={20} />
            <span>{link.name}</span>
          </Link>
        );
      })}
    </div>
  );
}