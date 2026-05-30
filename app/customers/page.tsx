"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageHeader from "../components/PageHeader";
import Card from "../components/card";
import { useAppContext } from "../context/AppContext";
import { getInvoiceStatus } from "@/lib/invoice-status";

type Customer = {
  id: string;
  name: string;
  email: string;
  country: string;
  state: string;
  address: string;
  zipcode: string;
  invoices: {
    id: string;
    description: string;
    amount: number;
    status: string;
    dueDate: string;
  }[];
};

export default function CustomersPage() {
  const { currentUser, showToast } = useAppContext();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      if (!currentUser) return;

      setLoading(true);

      const res = await fetch(`/api/customers?userId=${currentUser.id}`);
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Failed to load customers", "error");
        setLoading(false);
        return;
      }

      setCustomers(data.customers);
      setLoading(false);
    }

    loadCustomers();
  }, [currentUser, showToast]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const searchText = [
        customer.name,
        customer.email,
        customer.country,
        customer.state,
        customer.address,
      ]
        .join(" ")
        .toLowerCase();

      return searchText.includes(search.toLowerCase());
    });
  }, [customers, search]);

  const totalPaid = customers.reduce((total, customer) => {
    return (
      total +
      customer.invoices
        .filter(
          (invoice) =>
            getInvoiceStatus(invoice.status, invoice.dueDate) === "Paid"
        )
        .reduce((sum, invoice) => sum + Number(invoice.amount), 0)
    );
  }, 0);

  const totalPending = customers.reduce((total, customer) => {
    return (
      total +
      customer.invoices
        .filter(
          (invoice) =>
            getInvoiceStatus(invoice.status, invoice.dueDate) === "Pending"
        )
        .reduce((sum, invoice) => sum + Number(invoice.amount), 0)
    );
  }, 0);

  return (
    <div className="page">
      <PageHeader title="Customers" />

      <div className="summary-grid customer-summary-grid">
        <Card>
          <span className="metric-label">Total Customers</span>
          <strong className="metric-value">{customers.length}</strong>
        </Card>

        <Card>
          <span className="metric-label">Total Paid</span>
          <strong className="metric-value">${totalPaid.toLocaleString()}</strong>
        </Card>

        <Card>
          <span className="metric-label">Pending Value</span>
          <strong className="metric-value">
            ${totalPending.toLocaleString()}
          </strong>
        </Card>
      </div>

      <div className="filter-bar customer-filter-bar">
        <input
          placeholder="Search customers..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading ? (
        <Card>
          <p className="empty-copy">Loading customers...</p>
        </Card>
      ) : customers.length === 0 ? (
        <div className="invoice-empty">
          <h2>No customers yet</h2>
          <p>Customers are created automatically when you create invoices.</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="invoice-empty">
          <h2>No matching customers</h2>
          <p>Try a different name, email, or location.</p>
        </div>
      ) : (
        <div className="customer-grid">
          {filteredCustomers.map((customer) => {
            const paid = customer.invoices
              .filter(
                (invoice) =>
                  getInvoiceStatus(invoice.status, invoice.dueDate) === "Paid"
              )
              .reduce((sum, invoice) => sum + Number(invoice.amount), 0);

            const pending = customer.invoices
              .filter(
                (invoice) =>
                  getInvoiceStatus(invoice.status, invoice.dueDate) ===
                  "Pending"
              )
              .reduce((sum, invoice) => sum + Number(invoice.amount), 0);

            const overdue = customer.invoices
              .filter(
                (invoice) =>
                  getInvoiceStatus(invoice.status, invoice.dueDate) ===
                  "Overdue"
              )
              .reduce((sum, invoice) => sum + Number(invoice.amount), 0);

            return (
              <Card key={customer.id}>
                <div className="customer-card">
                  <div className="customer-card-header">
                    <div>
                      <h3>{customer.name}</h3>
                      <p>{customer.email}</p>
                    </div>

                    <span>{customer.invoices.length} invoices</span>
                  </div>

                  <div className="customer-location">
                    {customer.country}, {customer.state}
                  </div>

                  <p className="customer-address">
                    {customer.address} {customer.zipcode}
                  </p>

                  <div className="customer-money-grid">
                    <div>
                      <span>Paid</span>
                      <strong>${paid.toLocaleString()}</strong>
                    </div>

                    <div>
                      <span>Pending</span>
                      <strong>${pending.toLocaleString()}</strong>
                    </div>

                    <div>
                      <span>Overdue</span>
                      <strong>${overdue.toLocaleString()}</strong>
                    </div>
                  </div>

                  <Link
                    href={`/customers/${customer.id}`}
                    className="customer-view-link"
                  >
                    View Customer
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
