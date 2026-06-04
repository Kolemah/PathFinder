"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle, ShieldCheck } from "lucide-react";
import PageHeader from "../../../components/PageHeader";
import Card from "../../../components/card";
import Button from "../../../components/button";
import { formatCurrency, formatNaira } from "@/lib/wallet";

type AdminInvoice = {
  id: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
  };
};

type AdminTransaction = {
  id: string;
  type: string;
  amount: number;
  createdAt: string;
};

type AdminPayout = {
  id: string;
  amount: number;
  status: string;
  requestedAt: string;
};

type AdminUserDetail = {
  id: string;
  name: string;
  email: string;
  role: string;
  accountStatus: string;
  balance: number;
  createdAt: string;
  kycVerification: {
    status: string;
    provider: string;
    submittedAt?: string | null;
    verifiedAt?: string | null;
    rejectionReason?: string | null;
  } | null;
  invoices: AdminInvoice[];
  transactions: AdminTransaction[];
  payouts: AdminPayout[];
  customers: unknown[];
  stats: {
    invoiceCount: number;
    paidInvoiceCount: number;
    pendingUsd: number;
    totalPaidUsd: number;
    platformFeeUsd: number;
    totalPayouts: number;
    customerCount: number;
  };
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default function AdminUserPage() {
  const params = useParams<{ userId: string }>();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function updateUser(body: {
    role?: string;
    kycStatus?: string;
    accountStatus?: string;
  }) {
    if (saving) return;

    setSaving(true);
    setError("");

    const res = await fetch(`/api/admin/users/${params.userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Failed to update user");
      return;
    }

    setUser(data.user);
  }

  useEffect(() => {
    let active = true;

    async function loadCurrentUser() {
      const res = await fetch(`/api/admin/users/${params.userId}`);
      const data = await res.json();

      if (!active) return;

      if (!res.ok) {
        setError(data.error || "Failed to load user");
        setLoading(false);
        return;
      }

      setUser(data.user);
      setLoading(false);
    }

    loadCurrentUser().catch(() => {
      if (!active) return;
      setError("Failed to load user");
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [params.userId]);

  return (
    <div className="page admin-page">
      <Link href="/admin" className="admin-back-link">
        <ArrowLeft size={18} /> Back to admin
      </Link>

      <PageHeader title={user ? user.name : "User Details"} />

      {loading ? (
        <Card>
          <p className="empty-copy">Loading user...</p>
        </Card>
      ) : error && !user ? (
        <Card>
          <h2 className="panel-title">Could not load user</h2>
          <p className="empty-copy">{error}</p>
        </Card>
      ) : user ? (
        <>
          {error ? <p className="admin-error">{error}</p> : null}

          <div className="admin-summary-grid">
            <Card>
              <span className="metric-label">Available Balance</span>
              <strong className="metric-value">
                {formatNaira(Number(user.balance))}
              </strong>
              <p className="metric-note">Cleared balance in naira.</p>
            </Card>

            <Card>
              <span className="metric-label">Pending Balance</span>
              <strong className="metric-value">
                {formatNaira(Number(user.stats.pendingUsd))}
              </strong>
              <p className="metric-note">Paid invoices still pending.</p>
            </Card>

            <Card>
              <span className="metric-label">Total Payouts</span>
              <strong className="metric-value">
                {formatNaira(Number(user.stats.totalPayouts))}
              </strong>
              <p className="metric-note">All withdrawals requested.</p>
            </Card>

            <Card>
              <span className="metric-label">Platform Fee</span>
              <strong className="metric-value">
                {formatNaira(Number(user.stats.platformFeeUsd))}
              </strong>
              <p className="metric-note">Fee earned from this user.</p>
            </Card>
          </div>

          <div className="admin-detail-grid">
            <Card>
              <h2 className="panel-title">Profile</h2>

              <div className="admin-profile-list">
                <div>
                  <span>Email</span>
                  <strong>{user.email}</strong>
                </div>
                <div>
                  <span>Joined</span>
                  <strong>{formatDate(user.createdAt)}</strong>
                </div>
                <div>
                  <span>Customers</span>
                  <strong>{user.stats.customerCount}</strong>
                </div>
                <label>
                  <span>Role</span>
                  <select
                    value={user.role}
                    disabled={saving}
                    onChange={(event) =>
                      updateUser({ role: event.target.value })
                    }
                  >
                    <option value="Freelancer">Freelancer</option>
                    <option value="Admin">Admin</option>
                  </select>
                </label>
                <label>
                  <span>Account Status</span>
                  <select
                    value={user.accountStatus}
                    disabled={saving}
                    onChange={(event) =>
                      updateUser({ accountStatus: event.target.value })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Restricted">Restricted</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </label>
                <p className="metric-note">
                  Restricted users can log in but cannot create invoices or
                  request payouts. Terminated users cannot log in.
                </p>
              </div>
            </Card>

            <Card>
              <div className="admin-kyc-heading">
                <ShieldCheck size={22} />
                <h2 className="panel-title">KYC</h2>
              </div>

              <div className="admin-profile-list">
                <div>
                  <span>Status</span>
                  <strong>
                    {user.kycVerification?.status || "Not Submitted"}
                  </strong>
                </div>
                <div>
                  <span>Provider</span>
                  <strong>{user.kycVerification?.provider || "None"}</strong>
                </div>
              </div>

              <div className="admin-action-row">
                <Button
                  onClick={() => updateUser({ kycStatus: "Verified" })}
                  disabled={saving}
                >
                  <CheckCircle size={18} /> Verify KYC
                </Button>
                <Button
                  onClick={() => updateUser({ kycStatus: "Pending" })}
                  disabled={saving}
                >
                  Mark pending
                </Button>
                <Button
                  onClick={() => updateUser({ kycStatus: "Rejected" })}
                  disabled={saving}
                >
                  Reject
                </Button>
              </div>
            </Card>
          </div>

          <div className="admin-detail-grid">
            <Card>
              <h2 className="panel-title">Recent Invoices</h2>
              {user.invoices.length === 0 ? (
                <p className="empty-copy">No invoices yet.</p>
              ) : (
                <div className="admin-mini-list">
                  {user.invoices.slice(0, 8).map((invoice) => (
                    <div key={invoice.id} className="admin-mini-row">
                      <div>
                        <strong>{invoice.customer.name}</strong>
                        <span>{invoice.description}</span>
                      </div>
                      <div>
                        <strong>
                          {formatCurrency(Number(invoice.amount), invoice.currency)}
                        </strong>
                        <span>
                          {invoice.status} / {invoice.paymentStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <h2 className="panel-title">Recent Transactions</h2>
              {user.transactions.length === 0 ? (
                <p className="empty-copy">No transactions yet.</p>
              ) : (
                <div className="admin-mini-list">
                  {user.transactions.slice(0, 8).map((transaction) => (
                    <div key={transaction.id} className="admin-mini-row">
                      <div>
                        <strong>{transaction.type}</strong>
                        <span>{formatDate(transaction.createdAt)}</span>
                      </div>
                      <strong>{formatNaira(Number(transaction.amount))}</strong>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card>
            <h2 className="panel-title">Payouts</h2>
            {user.payouts.length === 0 ? (
              <p className="empty-copy">No payout requests yet.</p>
            ) : (
              <div className="admin-mini-list">
                {user.payouts.map((payout) => (
                  <div key={payout.id} className="admin-mini-row">
                    <div>
                      <strong>{formatNaira(Number(payout.amount))}</strong>
                      <span>Requested {formatDate(payout.requestedAt)}</span>
                    </div>
                    <strong>{payout.status}</strong>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      ) : null}
    </div>
  );
}
