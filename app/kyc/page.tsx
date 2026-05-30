"use client";

import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import Card from "../components/card";
import Button from "../components/button";
import { useAppContext } from "../context/AppContext";

type KycVerification = {
  id: string;
  provider: string;
  status: string;
  legalName: string;
  dateOfBirth: string;
  phone: string;
  country: string;
  idType: string;
  idLast4: string;
  providerRef?: string;
  rejectionReason?: string;
  submittedAt?: string;
  verifiedAt?: string;
};

type SmileConfig = {
  ready: boolean;
  name: string;
  partnerId: string;
  webTokenUrl: string;
  product: string;
  reference: string;
};

export default function KycPage() {
  const { currentUser, addNotification } = useAppContext();
  const [verification, setVerification] = useState<KycVerification | null>(null);
  const [saving, setSaving] = useState(false);
  const [smile, setSmile] = useState<SmileConfig | null>(null);
  const [form, setForm] = useState({
    legalName: "",
    dateOfBirth: "",
    phone: "",
    country: "Nigeria",
    idType: "BVN",
    idNumber: "",
  });

  useEffect(() => {
    async function loadKyc() {
      if (!currentUser) return;

      const res = await fetch(`/api/kyc?userId=${currentUser.id}`);
      const data = await res.json();

      if (res.ok && data.verification) {
        setVerification(data.verification);
        setForm((currentForm) => ({
          ...currentForm,
          legalName: data.verification.legalName || "",
          dateOfBirth: data.verification.dateOfBirth || "",
          phone: data.verification.phone || "",
          country: data.verification.country || "Nigeria",
          idType: data.verification.idType || "BVN",
        }));
      }

    }

    loadKyc();
  }, [currentUser]);

  async function submitKyc() {
    if (!currentUser || saving) return;

    setSaving(true);

    const res = await fetch("/api/kyc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: currentUser.id,
        ...form,
      }),
    });
    const data = await res.json();

    setSaving(false);

    if (!res.ok) {
      addNotification(data.error || "KYC submission failed", "error", {
        href: "/kyc",
        notificationType: "system",
      });
      return;
    }

    setVerification(data.verification);
    setSmile(data.provider);
    addNotification(data.message || "KYC submitted", "success", {
      href: "/kyc",
      notificationType: "system",
    });
  }

  function updateField(field: keyof typeof form, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function statusClass() {
    const status = verification?.status || "Not Submitted";

    if (status === "Verified") return "kyc-status kyc-status-verified";
    if (status === "Rejected") return "kyc-status kyc-status-rejected";
    if (status === "Pending") return "kyc-status kyc-status-pending";
    return "kyc-status";
  }

  return (
    <div className="page">
      <PageHeader title="KYC Verification" />

      <div className="kyc-layout">
        <Card>
          <div className="kyc-heading">
            <div>
              <span className="metric-label">Verification Status</span>
              <h2>{verification?.provider || "Smile ID"} KYC</h2>
            </div>

            <span className={statusClass()}>
              {verification?.status || "Not Submitted"}
            </span>
          </div>

          <div className="kyc-form">
            <label>
              Legal Name
              <input
                value={form.legalName}
                onChange={(event) => updateField("legalName", event.target.value)}
                placeholder="Your full legal name"
              />
            </label>

            <label>
              Date of Birth
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(event) =>
                  updateField("dateOfBirth", event.target.value)
                }
              />
            </label>

            <label>
              Phone Number
              <input
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="+234..."
              />
            </label>

            <label>
              Country
              <input
                value={form.country}
                onChange={(event) => updateField("country", event.target.value)}
              />
            </label>

            <label>
              ID Type
              <select
                value={form.idType}
                onChange={(event) => updateField("idType", event.target.value)}
              >
                <option value="BVN">BVN</option>
                <option value="NIN">NIN</option>
                <option value="Passport">Passport</option>
                <option value="Driver License">Driver License</option>
              </select>
            </label>

            <label>
              ID Number
              <input
                value={form.idNumber}
                onChange={(event) => updateField("idNumber", event.target.value)}
                placeholder="Stored securely as last 4 digits"
              />
            </label>
          </div>

          <div className="kyc-actions">
            <Button onClick={submitKyc} disabled={saving}>
              {saving ? "Submitting..." : "Submit KYC"}
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="panel-title">Smile Verification</h2>

          <div className="kyc-provider">
            <p>
              Smile ID is prepared for live KYC with NIN, biometric checks, and
              document verification. Add your Smile partner ID, web token URL,
              product, and webhook secret in `.env`.
            </p>

            {smile?.ready ? (
              <div className="kyc-provider-ready">
                <strong>Smile ID ready</strong>
                <span>Product: {smile.product}</span>
                <span>Reference: {smile.reference}</span>
              </div>
            ) : (
              <div className="kyc-provider-missing">
                <strong>Smile ID keys not configured</strong>
                <span>KYC will stay pending until live credentials are added.</span>
              </div>
            )}

            {verification?.idLast4 && (
              <p className="metric-note">
                Submitted {verification.idType} ending in {verification.idLast4}
              </p>
            )}

            {verification?.rejectionReason && (
              <p className="kyc-rejection">{verification.rejectionReason}</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
