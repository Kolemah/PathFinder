"use client";

import { useState } from "react";
import PageHeader from "../components/PageHeader";
import Card from "../components/card";
import Button from "../components/button";
import { useAppContext } from "../context/AppContext";

export default function SettingsPage() {
  const { profile, setProfile } = useAppContext();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="page">
      <PageHeader title="Settings" />

      <div style={{ maxWidth: 460, width: "100%" }}>
        <Card>
          <h2>Profile Settings</h2>

          <div style={{ marginTop: 20 }}>
            {profile.photo ? (
              <img
                src={profile.photo}
                alt="Profile"
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginBottom: 15,
                }}
              />
            ) : (
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "#0f172a",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 34,
                  fontWeight: "bold",
                  marginBottom: 15,
                }}
              >
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}

            <label
              style={{
                display: "inline-block",
                padding: "10px 16px",
                background: "#2563eb",
                color: "white",
                borderRadius: 10,
                cursor: "pointer",
                marginBottom: 10,
              }}
            >
              Change Profile Picture
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();

                  reader.onloadend = () => {
                    setProfile({
                      ...profile,
                      photo: reader.result as string,
                    });
                  };

                  reader.readAsDataURL(file);
                }}
              />
            </label>

            {profile.photo && (
              <div style={{ marginTop: 10, marginBottom: 20 }}>
                <Button
                  color="red"
                  onClick={() =>
                    setProfile({
                      ...profile,
                      photo: "",
                    })
                  }
                >
                  Delete Photo
                </Button>
              </div>
            )}

            <label>Name</label>
            <input
              value={profile.name}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
              style={inputStyle}
            />

            <label>Email</label>
            <input
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              style={inputStyle}
            />

            <label>Role</label>
            <input
              value={profile.role}
              onChange={(e) =>
                setProfile({ ...profile, role: e.target.value })
              }
              style={inputStyle}
            />

            <div style={{ marginTop: 20 }}>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>

            {saved && (
              <p style={{ marginTop: 15, color: "green" }}>
                Profile updated successfully
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  maxWidth: "100%",
  padding: 10,
  marginTop: 8,
  marginBottom: 15,
  borderRadius: 8,
  border: "1px solid #ccc",
  boxSizing: "border-box",
};