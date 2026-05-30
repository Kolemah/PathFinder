"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  CheckCircle2,
  CreditCard,
  FileText,
  Search,
  Wallet,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useAppContext } from "../context/AppContext";
import Link from "next/link";
import Image from "next/image";

type NotificationItem = {
  id: string | number;
  message: string;
  href?: string;
  type?: "payment" | "invoice" | "wallet" | "system";
  createdAt?: string;
};

function notificationMeta(item: NotificationItem) {
  const message = item.message.toLowerCase();
  const type =
    item.type ||
    (message.includes("paid") || message.includes("payment")
      ? "payment"
      : message.includes("wallet")
      ? "wallet"
      : message.includes("invoice") || message.includes("pdf")
      ? "invoice"
      : "system");

  if (type === "payment") {
    return {
      label: "Payment",
      className: "notification-payment",
      Icon: CreditCard,
    };
  }

  if (type === "wallet") {
    return {
      label: "Wallet",
      className: "notification-wallet",
      Icon: Wallet,
    };
  }

  if (type === "invoice") {
    return {
      label: "Invoice",
      className: "notification-invoice",
      Icon: FileText,
    };
  }

  return {
    label: "Update",
    className: "notification-system",
    Icon: CheckCircle2,
  };
}

function notificationTime(createdAt?: string) {
  if (!createdAt) return "Now";

  const time = new Date(createdAt);
  if (Number.isNaN(time.getTime())) return "Now";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(time);
}

export default function Topbar() {
  const {
    darkMode,
    setDarkMode,
    profile,
    notifications,
    clearNotifications,
  } = useAppContext();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const topbarRef = useRef<HTMLDivElement>(null);

  const initial = profile.name
    ? profile.name.charAt(0).toUpperCase()
    : "U";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        topbarRef.current &&
        !topbarRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
        setNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={topbarRef}
      className="topbar"
      style={{
        background: darkMode ? "#020617" : "rgba(255,255,255,0.9)",
        color: darkMode ? "white" : "#102033",
        borderBottom: darkMode
          ? "1px solid #1e293b"
          : "1px solid #dbe4ee",
        position: "relative",
      }}
    >
      <div
        className="search-box"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: darkMode ? "#1e293b" : "#eef4f8",
          padding: "10px 14px",
          borderRadius: 8,
          border: darkMode ? "1px solid #334155" : "1px solid #dbe4ee",
        }}
      >
<Search size={24} />
        <input
          placeholder="Search..."
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            width: "100%",
            color: darkMode ? "white" : "#0f172a",
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />

        <button
          aria-label="Open notifications"
          onClick={() => {
            setNotificationOpen(!notificationOpen);
            setProfileOpen(false);
          }}
          style={{
            position: "relative",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "inherit",
          }}
        >
          <Bell size={20} />

          {notifications.length > 0 && (
            <span
              style={{
                position: "absolute",
                top: -5,
                right: -5,
                background: "#dc2626",
                color: "white",
                borderRadius: "50%",
                width: 16,
                height: 16,
                fontSize: 10,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {notifications.length}
            </span>
          )}
        </button>

        {notificationOpen && (
          <div
            className={`notification-panel ${
              darkMode ? "notification-panel-dark" : ""
            }`}
          >
            <div className="notification-panel-header">
              <div>
                <h3>Notifications</h3>
                <p>{notifications.length} recent updates</p>
              </div>
            </div>

            {notifications.length === 0 && (
              <p className="notification-empty">No notifications yet</p>
            )}

            <div className="notification-list">
              {notifications.map((item) => {
                const meta = notificationMeta(item);
                const Icon = meta.Icon;
                const content = (
                  <>
                    <span className={`notification-icon ${meta.className}`}>
                      <Icon size={18} />
                    </span>

                    <span className="notification-copy">
                      <strong>{meta.label}</strong>
                      <span>{item.message}</span>
                      <small>{notificationTime(item.createdAt)}</small>
                    </span>
                  </>
                );

                if (item.href) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="notification-item notification-link"
                      onClick={() => setNotificationOpen(false)}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <div key={item.id} className="notification-item">
                    {content}
                  </div>
                );
              })}
            </div>

            {notifications.length > 0 && (
              <button
                onClick={() => {
                  clearNotifications();
                  setNotificationOpen(false);
                }}
                className="notification-clear"
              >
                Clear All
              </button>
            )}
          </div>
        )}

        <button
          onClick={() => {
            setProfileOpen(!profileOpen);
            setNotificationOpen(false);
          }}
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: darkMode ? "#0f766e" : "#102033",
            color: "white",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            overflow: "hidden",
            padding: 0,
          }}
        >
          {profile.photo ? (
            <Image
              src={profile.photo}
              alt="Profile"
              width={42}
              height={42}
              unoptimized
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            initial
          )}
        </button>

        {profileOpen && (
          <div
            style={{
              position: "absolute",
              right: 40,
              top: 60,
              background: darkMode ? "#0f172a" : "white",
              color: darkMode ? "white" : "#0f172a",
              border: darkMode
                ? "1px solid #334155"
                : "1px solid #dbe4ee",
              borderRadius: 8,
              width: 220,
              padding: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              zIndex: 999,
            }}
          >
            <div
              style={{
                padding: 10,
                borderBottom: darkMode
                  ? "1px solid #334155"
                  : "1px solid #dbe4ee",
              }}
            >
              <strong>{profile.name}</strong>

              <p
                style={{
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                {profile.email}
              </p>
            </div>

            <Link
              href="/settings"
              style={{
                display: "block",
                color: "inherit",
                textDecoration: "none",
                padding: 10,
              }}
            >
              Settings
            </Link>

            <div
              onClick={async () => {
                await fetch("/api/logout", {
                  method: "POST",
                });
                localStorage.removeItem("pathfinderLoggedIn");
                localStorage.removeItem("pathfinderUser");
                window.location.href = "/login";
              }}
              style={{
                padding: 10,
                cursor: "pointer",
                color: "#dc2626",
              }}
            >
              Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
