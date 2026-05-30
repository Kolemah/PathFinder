"use client";

import { jsPDF } from "jspdf";
import { Fragment, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  MoreVertical,
  Plus,
  Search,
  X,
} from "lucide-react";

import PageHeader from "../components/PageHeader";
import Button from "../components/button";
import InvoiceForm from "../components/InvoiceForm";
import { useAppContext } from "../context/AppContext";
import { getInvoiceStatus } from "@/lib/invoice-status";

export default function InvoicesPage() {
  const {
    invoices,
    setInvoices,
    addNotification,
    markInvoicePaid,
    renewExpiredInvoice,
    updateInvoice,
    deleteInvoice,
    darkMode,
    profile,
  } = useAppContext();

  type Invoice = (typeof invoices)[number];
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);

  const filteredInvoices = invoices.filter((invoice) => {
    const displayStatus = getInvoiceStatus(invoice.status, invoice.dueDate);
    const searchText = [
      invoice.name,
      invoice.gmail,
      invoice.country,
      invoice.state,
      invoice.description,
      displayStatus,
      String(invoice.amount),
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || displayStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const invoiceStats = invoices.reduce(
    (stats, invoice) => {
      const status = getInvoiceStatus(invoice.status, invoice.dueDate);
      const amount = Number(invoice.amount);

      stats.total += 1;

      if (status === "Paid") {
        stats.paid += amount;
      }

      if (status === "Pending") {
        stats.pending += 1;
      }

      if (status === "Overdue") {
        stats.overdue += 1;
      }

      return stats;
    },
    {
      total: 0,
      paid: 0,
      pending: 0,
      overdue: 0,
    }
  );

  function startEditing(invoice: Invoice) {
    setEditingId(invoice.id);
    setEditInvoice({ ...invoice });
  }

  function cancelEditing() {
    setEditingId(null);
    setEditInvoice(null);
  }

  async function saveEdit() {
    if (!editingId || !editInvoice) return;

    setSavingEdit(true);
    await updateInvoice(editingId, editInvoice);
    setSavingEdit(false);
    cancelEditing();
  }

  function updateEditField(
    field: keyof Invoice,
    value: string | number
  ) {
    if (!editInvoice) return;

    setEditInvoice({
      ...editInvoice,
      [field]: value,
    });
  }

  function formatDueDate(dueDate?: string) {
    if (!dueDate) return "Not set";

    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dueDate));
  }

  function formatAmount(amount: number) {
    return Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function paymentLink(invoiceId: string | number) {
    return `${window.location.origin}/pay/${invoiceId}`;
  }

  function invoiceMessage(invoice: Invoice) {
    const displayStatus = getInvoiceStatus(invoice.status, invoice.dueDate);

    if (displayStatus === "Overdue") {
      return [
        `Hello ${invoice.name},`,
        "",
        `Your invoice for $${formatAmount(Number(invoice.amount))} has expired.`,
        `Due date was: ${formatDueDate(invoice.dueDate)}`,
        "",
        "Please contact me for an updated invoice.",
        "",
        "Thank you.",
      ].join("\n");
    }

    return [
      `Hello ${invoice.name},`,
      "",
      `Your invoice for $${formatAmount(Number(invoice.amount))} is ready.`,
      `Due date: ${formatDueDate(invoice.dueDate)}`,
      `Status: ${displayStatus}`,
      "",
      "You can view and pay it here:",
      paymentLink(invoice.id),
      "",
      "Thank you.",
    ].join("\n");
  }

  async function copyPaymentLink(invoiceId: string | number) {
    await navigator.clipboard.writeText(paymentLink(invoiceId));
    addNotification("Payment link copied", "success", {
      href: `/pay/${invoiceId}`,
      notificationType: "invoice",
    });
  }

  async function copyInvoiceMessage(invoice: Invoice) {
    await navigator.clipboard.writeText(invoiceMessage(invoice));
    addNotification("Invoice message copied", "success", {
      href: `/pay/${invoice.id}`,
      notificationType: "invoice",
    });
  }

  function downloadPDF(invoice: Invoice) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 18;
    const invoiceNumber = String(invoice.id).slice(-8).toUpperCase();
    const displayStatus = getInvoiceStatus(invoice.status, invoice.dueDate);
    const statusColor =
      displayStatus === "Paid"
        ? { bg: [220, 252, 231], text: [22, 101, 52] }
        : displayStatus === "Overdue"
        ? { bg: [254, 226, 226], text: [153, 27, 27] }
        : { bg: [254, 243, 199], text: [146, 64, 14] };
    const amount = Number(invoice.amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const descriptionLines = doc.splitTextToSize(invoice.description, 118);
    const fileName = invoice.name
      .replace(/[^a-z0-9]/gi, "-")
      .replace(/-+/g, "-")
      .toLowerCase();

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 44, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("INVOICE", margin, 24);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("PathPayX", margin, 33);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`#${invoiceNumber}`, pageWidth - margin, 21, {
      align: "right",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Due ${formatDueDate(invoice.dueDate)}`, pageWidth - margin, 31, {
      align: "right",
    });

    if (invoice.paidAt) {
      doc.text(`Paid ${formatDueDate(invoice.paidAt)}`, pageWidth - margin, 39, {
        align: "right",
      });
    }

    doc.setFillColor(statusColor.bg[0], statusColor.bg[1], statusColor.bg[2]);
    doc.roundedRect(pageWidth - margin - 34, 52, 34, 11, 3, 3, "F");
    doc.setTextColor(
      statusColor.text[0],
      statusColor.text[1],
      statusColor.text[2]
    );
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(displayStatus.toUpperCase(), pageWidth - margin - 17, 59.5, {
      align: "center",
    });

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.text("From", margin, 58);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(profile.name || "PathPayX User", margin, 68);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(profile.email || "user@example.com", margin, 76);
    doc.text(profile.role || "Freelancer", margin, 84);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Bill To", 112, 58);
    doc.setFontSize(13);
    doc.text(invoice.name, 112, 68);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(invoice.gmail, 112, 76);
    doc.text(`${invoice.address}, ${invoice.state}`, 112, 84);
    doc.text(`${invoice.country} ${invoice.zipcode}`, 112, 92);

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 108, pageWidth - margin, 108);

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, 118, pageWidth - margin * 2, 14, 2, 2, "F");
    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("DESCRIPTION", margin + 6, 127);
    doc.text("AMOUNT", pageWidth - margin - 6, 127, { align: "right" });

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(descriptionLines, margin + 6, 144);
    doc.setFont("helvetica", "bold");
    doc.text(`$${amount}`, pageWidth - margin - 6, 144, { align: "right" });

    const totalY = Math.max(168, 144 + descriptionLines.length * 6);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, totalY, pageWidth - margin, totalY);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text("Subtotal", pageWidth - 78, totalY + 14);
    doc.text(`$${amount}`, pageWidth - margin, totalY + 14, { align: "right" });
    doc.text("Tax", pageWidth - 78, totalY + 24);
    doc.text("$0.00", pageWidth - margin, totalY + 24, { align: "right" });

    if (invoice.paymentReference) {
      doc.setFontSize(9);
      doc.text("Payment", margin, totalY + 16);
      doc.text(
        `${invoice.paymentMethod || "Received"} - ${invoice.paymentReference}`,
        margin,
        totalY + 26
      );
    }

    doc.setFillColor(15, 23, 42);
    doc.roundedRect(pageWidth - 88, totalY + 32, 70, 18, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("TOTAL", pageWidth - 82, totalY + 43);
    doc.text(`$${amount}`, pageWidth - 24, totalY + 43, { align: "right" });

    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      "Thank you for your business. Please use the invoice payment link to complete payment.",
      margin,
      276
    );

    doc.save(`${fileName || "client"}-invoice-${invoiceNumber}.pdf`);

    addNotification(
      `PDF downloaded for ${invoice.name}`,
      "success",
      {
        href: "/invoices",
        notificationType: "invoice",
      }
    );
  }

  function invoiceActions(invoice: Invoice, displayStatus: string, isPaid: boolean) {
    return (
      <details className="invoice-action-menu">
        <summary aria-label={`Actions for ${invoice.name}`}>
          <MoreVertical size={18} />
        </summary>

        <div>
          {displayStatus === "Pending" && (
            <button onClick={() => markInvoicePaid(invoice.id)}>Mark paid</button>
          )}

          <button onClick={() => downloadPDF(invoice)}>Download PDF</button>

          {displayStatus === "Pending" && (
            <>
              <button onClick={() => copyPaymentLink(invoice.id)}>
                Payment link
              </button>
              <button onClick={() => copyInvoiceMessage(invoice)}>
                Copy message
              </button>
            </>
          )}

          {displayStatus === "Overdue" && (
            <button onClick={() => renewExpiredInvoice(invoice.id)}>
              Renew invoice
            </button>
          )}

          {!isPaid && (
            <>
              <button onClick={() => startEditing(invoice)}>Edit</button>
              <button
                className="invoice-action-danger"
                onClick={() => deleteInvoice(invoice.id)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </details>
    );
  }

  function editPanel() {
    if (!editInvoice) return null;

    return (
      <div className="invoice-edit-form">
        <div className="invoice-edit-grid">
          <label>
            Client Name
            <input
              value={editInvoice.name}
              onChange={(event) => updateEditField("name", event.target.value)}
            />
          </label>

          <label>
            Client Email
            <input
              value={editInvoice.gmail}
              onChange={(event) => updateEditField("gmail", event.target.value)}
            />
          </label>

          <label>
            Country
            <input
              value={editInvoice.country}
              onChange={(event) =>
                updateEditField("country", event.target.value)
              }
            />
          </label>

          <label>
            State
            <input
              value={editInvoice.state}
              onChange={(event) => updateEditField("state", event.target.value)}
            />
          </label>

          <label>
            Address
            <input
              value={editInvoice.address}
              onChange={(event) =>
                updateEditField("address", event.target.value)
              }
            />
          </label>

          <label>
            Zip
            <input
              value={editInvoice.zipcode}
              onChange={(event) =>
                updateEditField("zipcode", event.target.value)
              }
            />
          </label>

          <label>
            Amount
            <input
              type="number"
              value={editInvoice.amount}
              onChange={(event) =>
                updateEditField("amount", Number(event.target.value))
              }
            />
          </label>

          <label>
            Status
            <select
              value={editInvoice.status}
              onChange={(event) => updateEditField("status", event.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </label>

          <label>
            Due Date
            <input
              type="date"
              value={editInvoice.dueDate ? editInvoice.dueDate.slice(0, 10) : ""}
              onChange={(event) =>
                updateEditField("dueDate", event.target.value)
              }
            />
          </label>
        </div>

        <label className="invoice-edit-description">
          Description
          <textarea
            value={editInvoice.description}
            onChange={(event) =>
              updateEditField("description", event.target.value)
            }
          />
        </label>

        <div className="invoice-edit-actions">
          <Button onClick={saveEdit} disabled={savingEdit}>
            {savingEdit ? "Saving..." : "Save Changes"}
          </Button>

          <Button color="#64748b" onClick={cancelEditing}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page invoice-page">
      <div className="invoice-page-header">
        <PageHeader title="Invoicing" />

        <button className="invoice-create-button" onClick={() => setCreateOpen(true)}>
          <Plus size={18} />
          Create invoice
        </button>
      </div>

      <div className="invoice-stat-grid">
        <div className="invoice-stat-card invoice-stat-total">
          <FileText size={26} />
          <span>Invoices</span>
          <strong>{invoiceStats.total}</strong>
        </div>

        <div className="invoice-stat-card invoice-stat-paid">
          <DollarSign size={26} />
          <span>Paid</span>
          <strong>${formatAmount(invoiceStats.paid)}</strong>
        </div>

        <div className="invoice-stat-card invoice-stat-pending">
          <Clock size={26} />
          <span>Pending</span>
          <strong>{invoiceStats.pending}</strong>
        </div>

        <div className="invoice-stat-card invoice-stat-overdue">
          <AlertCircle size={26} />
          <span>Due</span>
          <strong>{invoiceStats.overdue}</strong>
        </div>
      </div>

      <section className="invoice-history-section">
        <div className="invoice-history-header">
          <h2>Invoice history</h2>

          <div className="invoice-history-controls">
            <label className="invoice-search-control">
              <Search size={18} />
              <input
                placeholder="Search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <label className="invoice-filter-control">
              <Calendar size={16} />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="All">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
                <option value="Paid">Paid</option>
              </select>
            </label>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className={`invoice-empty ${darkMode ? "invoice-empty-dark" : ""}`}>
            <h2>No invoices yet</h2>
            <p>Create your first invoice to start tracking client payments.</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className={`invoice-empty ${darkMode ? "invoice-empty-dark" : ""}`}>
            <h2>No matching invoices</h2>
            <p>Try a different search term or status filter.</p>
          </div>
        ) : (
          <>
            <div className="invoice-table-wrap">
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Invoice no</th>
                    <th>Client</th>
                    <th>Created</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Due date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredInvoices.map((invoice) => {
                    const displayStatus = getInvoiceStatus(
                      invoice.status,
                      invoice.dueDate
                    );
                    const isPaid = displayStatus === "Paid";

                    return (
                      <Fragment key={invoice.id}>
                        <tr key={invoice.id}>
                          <td>#{String(invoice.id).slice(-10).toUpperCase()}</td>
                          <td>
                            <strong>{invoice.name}</strong>
                            <span>{invoice.gmail}</span>
                          </td>
                          <td>{formatDueDate(invoice.createdAt)}</td>
                          <td>${formatAmount(Number(invoice.amount))}</td>
                          <td>
                            <span
                              className={`invoice-status ${
                                displayStatus === "Paid"
                                  ? "invoice-status-paid"
                                  : displayStatus === "Overdue"
                                  ? "invoice-status-overdue"
                                  : "invoice-status-pending"
                              }`}
                            >
                              {displayStatus}
                            </span>
                          </td>
                          <td>{formatDueDate(invoice.dueDate)}</td>
                          <td>{invoiceActions(invoice, displayStatus, isPaid)}</td>
                        </tr>

                        {editingId === invoice.id && (
                          <tr className="invoice-edit-row">
                            <td colSpan={7}>{editPanel()}</td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="invoice-mobile-list">
              {filteredInvoices.map((invoice) => {
                const displayStatus = getInvoiceStatus(
                  invoice.status,
                  invoice.dueDate
                );
                const isPaid = displayStatus === "Paid";

                return (
                  <div key={invoice.id} className="invoice-mobile-card">
                    <div className="invoice-mobile-top">
                      <div>
                        <span>#{String(invoice.id).slice(-10).toUpperCase()}</span>
                        <strong>{invoice.name}</strong>
                        <p>{invoice.gmail}</p>
                      </div>

                      {invoiceActions(invoice, displayStatus, isPaid)}
                    </div>

                    <div className="invoice-mobile-meta">
                      <div>
                        <span>Amount</span>
                        <strong>${formatAmount(Number(invoice.amount))}</strong>
                      </div>
                      <div>
                        <span>Due date</span>
                        <strong>{formatDueDate(invoice.dueDate)}</strong>
                      </div>
                      <div>
                        <span>Status</span>
                        <strong>{displayStatus}</strong>
                      </div>
                    </div>

                    {editingId === invoice.id && editPanel()}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {createOpen && (
        <div className="invoice-modal-backdrop" role="dialog" aria-modal="true">
          <div className="invoice-modal">
            <button
              className="invoice-modal-close"
              aria-label="Close create invoice"
              onClick={() => setCreateOpen(false)}
            >
              <X size={20} />
            </button>

            <InvoiceForm
              onCreate={(invoice) => {
                setInvoices([
                  invoice,
                  ...invoices,
                ]);

                addNotification(
                  `Invoice created for ${invoice.name}`,
                  "success",
                  {
                    href: "/invoices",
                    notificationType: "invoice",
                  }
                );

                setCreateOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
