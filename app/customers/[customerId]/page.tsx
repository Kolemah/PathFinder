"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Card from "../../components/card";
import PageHeader from "../../components/PageHeader";
import { useAppContext } from "../../context/AppContext";
import { getInvoiceStatus } from "@/lib/invoice-status";

type CustomerInvoice = {
  id: string;
  description: string;
  amount: number;
  status: string;
  dueDate: string;
  paidAt: string | null;
  paymentReference: string | null;
  paymentStatus: string;
  createdAt: string;
};

type CustomerDetail = {
  id: string;
  name: string;
  email: string;
  country: string;
  state: string;
  address: string;
  zipcode: string;
  createdAt: string;
  invoices: CustomerInvoice[];
};

function formatDate(date?: string | null) {
  if (!date) return "Not set";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default function CustomerDetailPage() {
  const params = useParams<{ customerId: string }>();
  const { showToast } = useAppContext();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomer() {
      setLoading(true);

      const res = await fetch(`/api/customers/${params.customerId}`);
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Failed to load customer", "error");
        setLoading(false);
        return;
      }

      setCustomer(data.customer);
      setLoading(false);
    }

    loadCustomer();
  }, [params.customerId, showToast]);

  const stats = useMemo(() => {
    const invoices = customer?.invoices || [];

    return invoices.reduce(
      (summary, invoice) => {
        const status = getInvoiceStatus(invoice.status, invoice.dueDate);
        const amount = Number(invoice.amount);

        summary.total += amount;
        summary.count += 1;

        if (status === "Paid") {
          summary.paid += amount;
          summary.paidCount += 1;
        }

        if (status === "Pending") {
          summary.pending += amount;
          summary.pendingCount += 1;
        }

        if (status === "Overdue") {
          summary.overdue += amount;
          summary.overdueCount += 1;
        }

        return summary;
      },
      {
        total: 0,
        paid: 0,
        pending: 0,
        overdue: 0,
        count: 0,
        paidCount: 0,
        pendingCount: 0,
        overdueCount: 0,
      }
    );
  }, [customer]);

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Customer" />
        <Card>
          <p className="empty-copy">Loading customer...</p>
        </Card>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="page">
        <PageHeader title="Customer" />
        <div className="invoice-empty">
          <h2>Customer not found</h2>
          <p>This customer may have been deleted or does not belong to you.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="customer-detail-top">
        <PageHeader title={customer.name} />
        <Link href="/customers" className="customer-view-link">
          Back to Customers
        </Link>
      </div>

      <div className="customer-detail-layout">
        <Card>
          <div className="customer-profile-card">
            <div className="customer-avatar-large">
              {customer.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <span className="metric-label">Customer</span>
              <h2>{customer.name}</h2>
              <p>{customer.email}</p>
            </div>

            <div className="customer-contact-grid">
              <div>
                <span>Location</span>
                <strong>
                  {customer.country}, {customer.state}
                </strong>
              </div>

              <div>
                <span>Address</span>
                <strong>
                  {customer.address} {customer.zipcode}
                </strong>
              </div>

              <div>
                <span>Customer Since</span>
                <strong>{formatDate(customer.createdAt)}</strong>
              </div>
            </div>
          </div>
        </Card>

        <div className="customer-detail-stats">
          <Card>
            <span className="metric-label">Total Value</span>
            <strong className="metric-value">${stats.total.toLocaleString()}</strong>
            <p className="metric-note">{stats.count} invoices created</p>
          </Card>

          <Card>
            <span className="metric-label">Paid</span>
            <strong className="metric-value">${stats.paid.toLocaleString()}</strong>
            <p className="metric-note">{stats.paidCount} paid invoices</p>
          </Card>

          <Card>
            <span className="metric-label">Pending</span>
            <strong className="metric-value">
              ${stats.pending.toLocaleString()}
            </strong>
            <p className="metric-note">{stats.pendingCount} awaiting payment</p>
          </Card>

          <Card>
            <span className="metric-label">Overdue</span>
            <strong className="metric-value">
              ${stats.overdue.toLocaleString()}
            </strong>
            <p className="metric-note">{stats.overdueCount} expired invoices</p>
          </Card>
        </div>
      </div>

      <Card>
        <div className="customer-invoice-header">
          <div>
            <h2 className="panel-title">Invoice History</h2>
            <p className="empty-copy">
              Every invoice created for this customer appears here.
            </p>
          </div>
        </div>

        {customer.invoices.length === 0 ? (
          <p className="empty-copy">No invoices have been created yet.</p>
        ) : (
          <div className="customer-invoice-list">
            {customer.invoices.map((invoice) => {
              const status = getInvoiceStatus(invoice.status, invoice.dueDate);

              return (
                <div key={invoice.id} className="customer-invoice-row">
                  <div>
                    <strong>{invoice.description}</strong>
                    <span>
                      Created {formatDate(invoice.createdAt)} - Due{" "}
                      {formatDate(invoice.dueDate)}
                    </span>
                    {invoice.paymentReference && (
                      <small>Ref: {invoice.paymentReference}</small>
                    )}
                  </div>

                  <strong>${Number(invoice.amount).toLocaleString()}</strong>

                  <span
                    className={`invoice-status ${
                      status === "Paid"
                        ? "invoice-status-paid"
                        : status === "Overdue"
                        ? "invoice-status-overdue"
                        : "invoice-status-pending"
                    }`}
                  >
                    {status}
                  </span>

                  <Link href={`/pay/${invoice.id}`} className="customer-view-link">
                    View
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
