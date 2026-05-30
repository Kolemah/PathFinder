"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Menu, X } from "lucide-react";

const menuLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Trust", href: "#trust" },
];

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="landing-nav">
        <div className="landing-logo">
          <Image src="/logo-pathpayx-brand.png" alt="PathPayX" width={160} height={60} />
        </div>

        <div className="landing-center">
          {menuLinks.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
        </div>

        <div className="landing-right">
          <Link href="/login" className="login-btn">
            Login
          </Link>

          <Link href="/register" className="signup-btn">
            Get Started <ArrowRight size={17} />
          </Link>
        </div>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          className="landing-menu-btn"
          onClick={(event) => {
            event.stopPropagation();
            setOpen(true);
          }}
        >
          <Menu size={30} />
        </button>
      </nav>

      {open && (
        <div className="landing-mobile-menu" role="dialog" aria-modal="true">
          <div className="landing-mobile-header">
            <Image src="/logo-pathpayx-brand.png" alt="PathPayX" width={160} height={60} />

            <button
              type="button"
              aria-label="Close menu"
              onClick={(event) => {
                event.stopPropagation();
                setOpen(false);
              }}
            >
              <X size={34} />
            </button>
          </div>

          <div className="landing-mobile-links">
            {menuLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}

            <Link href="/login" onClick={() => setOpen(false)}>
              Login
            </Link>

            <Link
              href="/register"
              className="landing-mobile-signup"
              onClick={() => setOpen(false)}
            >
              Get Started <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
