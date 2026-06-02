"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { createContext, useContext, useEffect, useState } from "react";

type Transaction = {
  id: string | number;
  type: string;
  amount: number;
};

type Invoice = {
  id: string | number;
  name: string;
  gmail: string;
  country: string;
  state: string;
  address: string;
  zipcode: string;
  description: string;
  amount: number;
  status: string;
  createdAt?: string;
  dueDate?: string;
  paidAt?: string;
  paymentAvailableAt?: string;
  paymentMethod?: string;
  paymentReference?: string;
  paymentStatus?: string;
  checkoutProvider?: string;
  platformFeeRate?: number;
  platformFeeUsd?: number;
  netAmountUsd?: number;
  netAmountNgn?: number;
  exchangeRate?: number;
  fundsReleasedAt?: string;
};

type Profile = {
  name: string;
  email: string;
  role: string;
  photo: string;
};

type Notification = {
  id: string | number;
  message: string;
  href?: string;
  type?: "payment" | "invoice" | "wallet" | "system";
  createdAt?: string;
};

type Toast = {
  id: number;
  message: string;
  type: "success" | "error" | "info";
};

type LoggedInUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  photo?: string;
  balance?: number;
  darkMode?: boolean;
  emailVerified?: boolean;
  accountStatus?: string;
};

type AppContextType = {
  currentUser: LoggedInUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<LoggedInUser | null>>;
  refreshUserData: () => Promise<void>;

  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  saveBalance: (nextBalance: number) => Promise<void>;

  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  createTransaction: (type: string, amount: number) => Promise<Transaction | null>;

  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  markInvoicePaid: (invoiceId: string | number) => Promise<void>;
  renewExpiredInvoice: (invoiceId: string | number) => Promise<void>;
  updateInvoice: (invoiceId: string | number, nextInvoice: Invoice) => Promise<void>;
  deleteInvoice: (invoiceId: string | number) => Promise<void>;

  darkMode: boolean;
  setDarkMode: (value: boolean) => void;

  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  saveProfile: (nextProfile: Profile) => Promise<void>;

  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  clearNotifications: () => Promise<void>;
  addNotification: (
    message: string,
    type?: Toast["type"],
    options?: {
      href?: string;
      notificationType?: Notification["type"];
    }
  ) => void;

  toasts: Toast[];
  removeToast: (id: number) => void;
  showToast: (message: string, type?: Toast["type"]) => void;
};

const AppContext = createContext<AppContextType | null>(null);

function invoiceFromDatabase(invoice: {
  id: string;
  description: string;
  amount: number;
  status: string;
  createdAt?: string | Date;
  dueDate?: string | Date;
  paidAt?: string | Date | null;
  paymentAvailableAt?: string | Date | null;
  paymentMethod?: string | null;
  paymentReference?: string | null;
  paymentStatus?: string;
  checkoutProvider?: string | null;
  platformFeeRate?: number;
  platformFeeUsd?: number;
  netAmountUsd?: number;
  netAmountNgn?: number;
  exchangeRate?: number;
  fundsReleasedAt?: string | Date | null;
  customer: {
    name: string;
    email: string;
    country: string;
    state: string;
    address: string;
    zipcode: string;
  };
}): Invoice {
  return {
    id: invoice.id,
    name: invoice.customer.name,
    gmail: invoice.customer.email,
    country: invoice.customer.country,
    state: invoice.customer.state,
    address: invoice.customer.address,
    zipcode: invoice.customer.zipcode,
    description: invoice.description,
    amount: invoice.amount,
    status: invoice.status,
    createdAt: invoice.createdAt ? new Date(invoice.createdAt).toISOString() : "",
    dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString() : "",
    paidAt: invoice.paidAt ? new Date(invoice.paidAt).toISOString() : "",
    paymentAvailableAt: invoice.paymentAvailableAt
      ? new Date(invoice.paymentAvailableAt).toISOString()
      : "",
    paymentMethod: invoice.paymentMethod || "",
    paymentReference: invoice.paymentReference || "",
    paymentStatus: invoice.paymentStatus || "Unpaid",
    checkoutProvider: invoice.checkoutProvider || "",
    platformFeeRate: Number(invoice.platformFeeRate ?? 0.1),
    platformFeeUsd: Number(invoice.platformFeeUsd ?? 0),
    netAmountUsd: Number(invoice.netAmountUsd ?? 0),
    netAmountNgn: Number(invoice.netAmountNgn ?? 0),
    exchangeRate: Number(invoice.exchangeRate ?? 1393.23),
    fundsReleasedAt: invoice.fundsReleasedAt
      ? new Date(invoice.fundsReleasedAt).toISOString()
      : "",
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<LoggedInUser | null>(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  const [profile, setProfile] = useState<Profile>({
    name: "Johnson",
    email: "user@example.com",
    role: "Freelancer",
    photo: "",
  });

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      message: "Welcome to PathPayX",
      href: "/dashboard",
      type: "system",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  function showToast(message: string, type: Toast["type"] = "info") {
    const id = Date.now();

    setToasts((currentToasts) => [
      ...currentToasts,
      {
        id,
        message,
        type,
      },
    ]);

    window.setTimeout(() => {
      removeToast(id);
    }, 3500);
  }

  function removeToast(id: number) {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  }

  function addNotification(
    message: string,
    type: Toast["type"] = "success",
    options: {
      href?: string;
      notificationType?: Notification["type"];
    } = {}
  ) {
    const temporaryId = `temp-${Date.now()}`;
    const notification = {
      id: temporaryId,
      message,
      href: options.href,
      type: options.notificationType || "system",
      createdAt: new Date().toISOString(),
    };

    setNotifications((currentNotifications) => [
      notification,
      ...currentNotifications,
    ]);

    showToast(message, type);

    if (!currentUser) return;

    fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: currentUser.id,
        message,
        href: options.href,
        type: options.notificationType || "system",
      }),
    })
      .then(async (res) => {
        if (!res.ok) return;

        const data = await res.json();
        const savedNotification = data.notification as Notification;

        setNotifications((currentNotifications) =>
          currentNotifications.map((item) =>
            item.id === temporaryId ? savedNotification : item
          )
        );
      })
      .catch((error) => {
        console.log("SAVE NOTIFICATION ERROR:", error);
      });
  }

  async function clearNotifications() {
    setNotifications([]);

    if (!currentUser) return;

    const res = await fetch(`/api/notifications?userId=${currentUser.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      showToast("Failed to clear notifications", "error");
    }
  }

  async function refreshUserData() {
    const sessionRes = await fetch("/api/session");

    if (!sessionRes.ok) return;

    const sessionData = await sessionRes.json();
    const user = sessionData.user as LoggedInUser;
    setCurrentUser(user);
    localStorage.setItem("pathfinderUser", JSON.stringify(user));

    const userRes = await fetch(`/api/user?userId=${user.id}`);

    if (userRes.ok) {
      const data = await userRes.json();
      const dbUser = data.user as LoggedInUser;

      setCurrentUser(dbUser);
      setBalance(Number(dbUser.balance ?? 0));
      setDarkMode(Boolean(dbUser.darkMode));
      setProfile({
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role || "Freelancer",
        photo: dbUser.photo || "",
      });
      localStorage.setItem("pathfinderUser", JSON.stringify(dbUser));
    }

    const [invoicesRes, transactionsRes, notificationsRes] = await Promise.all([
      fetch(`/api/invoices?userId=${user.id}`),
      fetch(`/api/transactions?userId=${user.id}`),
      fetch(`/api/notifications?userId=${user.id}`),
    ]);

    if (invoicesRes.ok) {
      const data = await invoicesRes.json();
      setInvoices(data.invoices.map(invoiceFromDatabase));
    }

    if (transactionsRes.ok) {
      const data = await transactionsRes.json();
      setTransactions(data.transactions);
    }

    if (notificationsRes.ok) {
      const data = await notificationsRes.json();
      setNotifications(data.notifications);
    }
  }

  async function saveBalance(nextBalance: number) {
    setBalance(nextBalance);

    if (!currentUser) return;

    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: currentUser.id,
        balance: nextBalance,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const updatedUser = data.user as LoggedInUser;
      setCurrentUser(updatedUser);
      localStorage.setItem("pathfinderUser", JSON.stringify(updatedUser));
    }
  }

  async function createTransaction(type: string, amount: number) {
    if (!currentUser) return null;

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: currentUser.id,
        type,
        amount,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const transaction = data.transaction as Transaction;
    setTransactions((currentTransactions) => [
      transaction,
      ...currentTransactions,
    ]);
    return transaction;
  }

  async function markInvoicePaid(invoiceId: string | number) {
    if (!currentUser) return;

    const invoice = invoices.find((item) => item.id === invoiceId);
    if (!invoice) return;

    const res = await fetch("/api/invoices", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: invoiceId,
        userId: currentUser.id,
        status: "Paid",
      }),
    });

    if (!res.ok) {
      addNotification("Invoice payment update failed", "error");
      return;
    }

    const data = await res.json();
    const updatedInvoice = invoiceFromDatabase(data.invoice);

    setInvoices((currentInvoices) =>
      currentInvoices.map((item) =>
        item.id === invoiceId ? updatedInvoice : item
      )
    );

    await createTransaction("Payment Pending Clearance", Number(invoice.amount));
    await refreshUserData();
    addNotification(`${invoice.name} payment is pending 3-day clearance`, "success", {
      href: "/wallet",
      notificationType: "payment",
    });
  }

  async function renewExpiredInvoice(invoiceId: string | number) {
    if (!currentUser) return;

    const sourceInvoice = invoices.find((item) => item.id === invoiceId);
    if (!sourceInvoice) return;

    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: currentUser.id,
        sourceInvoiceId: invoiceId,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      addNotification(data.error || "Invoice renewal failed", "error");
      return;
    }

    const data = await res.json();
    const newInvoice = invoiceFromDatabase(data.invoice);

    setInvoices((currentInvoices) => [
      newInvoice,
      ...currentInvoices,
    ]);
    addNotification(`New invoice created for ${sourceInvoice.name}`, "success", {
      href: "/invoices",
      notificationType: "invoice",
    });
  }

  async function updateInvoice(
    invoiceId: string | number,
    nextInvoice: Invoice
  ) {
    if (!currentUser) return;

    const res = await fetch("/api/invoices", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: invoiceId,
        userId: currentUser.id,
        name: nextInvoice.name,
        gmail: nextInvoice.gmail,
        country: nextInvoice.country,
        state: nextInvoice.state,
        address: nextInvoice.address,
        zipcode: nextInvoice.zipcode,
        description: nextInvoice.description,
        amount: nextInvoice.amount,
        status: nextInvoice.status,
        dueDate: nextInvoice.dueDate,
      }),
    });

    if (!res.ok) {
      addNotification("Invoice update failed", "error");
      return;
    }

    const data = await res.json();
    const updatedInvoice = invoiceFromDatabase(data.invoice);

    setInvoices((currentInvoices) =>
      currentInvoices.map((invoice) =>
        invoice.id === invoiceId ? updatedInvoice : invoice
      )
    );

    addNotification("Invoice updated", "success", {
      href: "/invoices",
      notificationType: "invoice",
    });
  }

  async function deleteInvoice(invoiceId: string | number) {
    if (!currentUser) return;

    const res = await fetch(
      `/api/invoices?id=${invoiceId}&userId=${currentUser.id}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {
      addNotification("Invoice delete failed", "error");
      return;
    }

    setInvoices((currentInvoices) =>
      currentInvoices.filter((invoice) => invoice.id !== invoiceId)
    );
    addNotification("Invoice deleted", "success", {
      href: "/invoices",
      notificationType: "invoice",
    });
  }

  async function saveProfile(nextProfile: Profile) {
    setProfile(nextProfile);

    if (!currentUser) return;

    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: currentUser.id,
        ...nextProfile,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const updatedUser = data.user as LoggedInUser;
      setCurrentUser(updatedUser);
      localStorage.setItem("pathfinderUser", JSON.stringify(updatedUser));
    }
  }

  async function saveDarkMode(nextDarkMode: boolean) {
    setDarkMode(nextDarkMode);
    localStorage.setItem("darkMode", JSON.stringify(nextDarkMode));

    if (!currentUser) return;

    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: currentUser.id,
        darkMode: nextDarkMode,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const updatedUser = data.user as LoggedInUser;
      setCurrentUser(updatedUser);
      localStorage.setItem("pathfinderUser", JSON.stringify(updatedUser));
    }
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    const savedProfile = localStorage.getItem("profile");
    const savedBalance = localStorage.getItem("balance");
    const savedTransactions = localStorage.getItem("transactions");
    const savedInvoices = localStorage.getItem("invoices");

    if (savedTheme) setDarkMode(JSON.parse(savedTheme));
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedBalance) setBalance(Number(savedBalance));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedInvoices) setInvoices(JSON.parse(savedInvoices));

    refreshUserData().catch((error) => {
      console.log("LOAD APP DATA ERROR:", error);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("profile", JSON.stringify(profile));
    localStorage.setItem("balance", String(balance));
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("invoices", JSON.stringify(invoices));
  }, [darkMode, profile, balance, transactions, invoices]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        refreshUserData,
        balance,
        setBalance,
        saveBalance,
        transactions,
        setTransactions,
        createTransaction,
        invoices,
        setInvoices,
        markInvoicePaid,
        renewExpiredInvoice,
        updateInvoice,
        deleteInvoice,
        darkMode,
        setDarkMode: saveDarkMode,
        profile,
        setProfile,
        saveProfile,
        notifications,
        setNotifications,
        clearNotifications,
        addNotification,
        toasts,
        removeToast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }

  return context;
}
