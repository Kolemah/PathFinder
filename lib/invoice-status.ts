export type InvoiceStatus = "Paid" | "Pending" | "Overdue";

export function getInvoiceStatus(status: string, dueDate?: string | Date | null) {
  if (status === "Paid") return "Paid";
  if (!dueDate) return "Pending";

  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return "Pending";

  due.setHours(23, 59, 59, 999);

  return due.getTime() < Date.now() ? "Overdue" : "Pending";
}
