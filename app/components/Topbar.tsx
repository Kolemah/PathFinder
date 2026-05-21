"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Search } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useAppContext } from "../context/AppContext";
import Link from "next/link";

export default function Topbar() {
  const {
    darkMode,
    setDarkMode,
    profile,
    notifications,
    setNotifications,
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
        background: darkMode ? "#020617" : "white",
        color: darkMode ? "white" : "#0f172a",
        borderBottom: darkMode
          ? "1px solid #1e293b"
          : "1px solid #e5e7eb",
        position: "relative",
      }}
    >
      <div
        className="search-box"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: darkMode ? "#1e293b" : "#f1f5f9",
          padding: "10px 14px",
          borderRadius: 10,
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
                background: "red",
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
            style={{
              position: "absolute",
              top: 60,
              right: 100,
              width: 260,
              background: darkMode ? "#0f172a" : "white",
              color: darkMode ? "white" : "#0f172a",
              border: darkMode
                ? "1px solid #334155"
                : "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 15,
              boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
              zIndex: 999,
            }}
          >
            <h3>Notifications</h3>

            {notifications.length === 0 && (
              <p style={{ marginTop: 10 }}>No notifications</p>
            )}

            {notifications.map((item) => (
              <div
                key={item.id}
                style={{
                  marginTop: 10,
                  padding: 10,
                  borderRadius: 8,
                  background: darkMode ? "#1e293b" : "#f1f5f9",
                }}
              >
                {item.message}
              </div>
            ))}

            {notifications.length > 0 && (
              <button
                onClick={() => setNotifications([])}
                style={{
                  width: "100%",
                  marginTop: 10,
                  padding: 10,
                  border: "none",
                  borderRadius: 8,
                  background: "red",
                  color: "white",
                  cursor: "pointer",
                }}
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
            background: darkMode ? "#2563eb" : "#0f172a",
            color: "white",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            overflow: "hidden",
            padding: 0,
          }}
        >
          {profile.photo ? (
            <img
              src={profile.photo}
              alt="Profile"
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
                : "1px solid #e5e7eb",
              borderRadius: 12,
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
                  : "1px solid #e5e7eb",
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
              onClick={() => {
                localStorage.removeItem("pathfinderLoggedIn");
                window.location.href = "/login";
              }}
              style={{
                padding: 10,
                cursor: "pointer",
                color: "red",
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