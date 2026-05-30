"use client";

import { useState } from "react";
import Image from "next/image";
import PageHeader from "../components/PageHeader";
import Card from "../components/card";
import Button from "../components/button";
import { useAppContext } from "../context/AppContext";

export default function SettingsPage() {
  const { profile, setProfile, saveProfile, showToast } = useAppContext();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);

    await saveProfile(profile);

    setSaving(false);
    setSaved(true);
    showToast("Profile updated successfully", "success");
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="page">
      <PageHeader title="Settings" />

      <div className="settings-panel">
        <Card>
          <h2>Profile Settings</h2>

          <div className="settings-form">
            {profile.photo ? (
              <Image
                src={profile.photo}
                alt="Profile"
                width={100}
                height={100}
                unoptimized
                className="settings-avatar"
              />
            ) : (
              <div className="settings-avatar-placeholder">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}

            <label
              className="settings-upload-button"
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
              <div className="settings-delete-photo">
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

            <label className="settings-label">Name</label>
            <input
              value={profile.name}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
              style={inputStyle}
            />

            <label className="settings-label">Email</label>
            <input
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              style={inputStyle}
            />

            <label className="settings-label">Role</label>
            <input
              value={profile.role}
              onChange={(e) =>
                setProfile({ ...profile, role: e.target.value })
              }
              style={inputStyle}
            />

            <div style={{ marginTop: 20 }}>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
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
  overflow: "hidden",
  textOverflow: "ellipsis",
};
