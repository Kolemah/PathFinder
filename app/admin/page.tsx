"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Card from "../components/card";
import { formatNaira, formatUsd } from "@/lib/wallet";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  accountStatus: string;
  balance: number;
  createdAt: string;
  kycStatus: string;
  invoiceCount: number;
  paidInvoiceCount: number;
  pendingUsd: number;
  totalPaidUsd: number;
  platformFeeUsd: number;
  totalPayouts: number;
  transactionCount: number;
  customerCount: number;
};

type AdminSummary = {
  users: number;
  availableNgn: number;
  pendingUsd: number;
  paidUsd: number;
  platformFeeUsd: number;
  payoutsNgn: number;
};

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAdminUsers() {
      const res = await fetch("/api/admin/users");
      const data = await res.json();

      if (!active) return;

      if (!res.ok) {
        setError(data.error || "Failed to load admin dashboard");
        setLoading(false);
        return;
      }

      setUsers(data.users);
      setSummary(data.summary);
      setLoading(false);
    }

    loadAdminUsers().catch(() => {
      if (!active) return;
      setError("Failed to load admin dashboard");
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return users;

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        user.role.toLowerCase().includes(normalizedSearch) ||
        user.accountStatus.toLowerCase().includes(normalizedSearch) ||
        user.kycStatus.toLowerCase().includes(normalizedSearch)
    );
  }, [search, users]);

  return (
    <div className="page admin-page">
      <PageHeader title="Admin Dashboard" />

      {loading ? (
        <Card>
          <p className="empty-copy">Loading admin data...</p>
        </Card>
      ) : error ? (
        <Card>
          <h2 className="panel-title">Admin access needed</h2>
          <p className="empty-copy">{error}</p>
        </Card>
      ) : (
        <>
          <div className="admin-summary-grid">
            <Card>
              <span className="metric-label">Users</span>
              <strong className="metric-value">{summary?.users || 0}</strong>
              <p className="metric-note">Total signed-up accounts.</p>
            </Card>

            <Card>
              <span className="metric-label">Available Balance</span>
              <strong className="metric-value">
                {formatNaira(summary?.availableNgn || 0)}
              </strong>
              <p className="metric-note">Total naira balance held by users.</p>
            </Card>

            <Card>
              <span className="metric-label">Pending USD</span>
              <strong className="metric-value">
                {formatUsd(summary?.pendingUsd || 0)}
              </strong>
              <p className="metric-note">Paid invoices still in 3-day hold.</p>
            </Card>

            <Card>
              <span className="metric-label">Platform Fees</span>
              <strong className="metric-value">
                {formatUsd(summary?.platformFeeUsd || 0)}
              </strong>
              <p className="metric-note">Fees earned from paid invoices.</p>
            </Card>
          </div>

          <Card>
            <div className="admin-table-header">
              <div>
                <h2 className="panel-title">People</h2>
                <p className="empty-copy">
                  Manage users, earnings, KYC status, invoices, and payouts.
                </p>
              </div>

              <label className="admin-search">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search users"
                />
              </label>
            </div>

            {filteredUsers.length === 0 ? (
              <p className="empty-copy">No users match your search.</p>
            ) : (
              <div className="admin-user-list">
                {filteredUsers.map((user) => (
                  <Link
                    key={user.id}
                    href={`/admin/users/${user.id}`}
                    className="admin-user-row"
                  >
                    <div>
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>

                    <div>
                      <span>Available</span>
                      <strong>{formatNaira(Number(user.balance))}</strong>
                    </div>

                    <div>
                      <span>Pending</span>
                      <strong>{formatUsd(Number(user.pendingUsd))}</strong>
                    </div>

                    <div>
                      <span>Account</span>
                      <strong>{user.accountStatus}</strong>
                    </div>

                    <div>
                      <span>KYC</span>
                      <strong>{user.kycStatus}</strong>
                    </div>

                    <div>
                      <span>Invoices</span>
                      <strong>{user.invoiceCount}</strong>
                    </div>

                    <ArrowRight size={20} />
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
