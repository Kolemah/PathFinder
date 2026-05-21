"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Transaction = {
  id: number;
  type: string;
  amount: number;
};

type Invoice = {
  id: number;
  name: string;
  gmail: string;
  country: string;
  state: string;
  address: string;
  zipcode: string;
  description: string;
  amount: number;
  status: string;
};

type Profile = {
  name: string;
  email: string;
  role: string;
  photo: string;
};

type Notification = {
  id: number;
  message: string;
};

type AppContextType = {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;

  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;

  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;

  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;

  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;

  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  addNotification: (message: string) => void;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState(2450);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, type: "Credit", amount: 500 },
    { id: 2, type: "Debit", amount: 200 },
  ]);

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
      message: "Welcome to PathFinder",
    },
  ]);

  function addNotification(message: string) {
    setNotifications((currentNotifications) => [
      {
        id: Date.now(),
        message,
      },
      ...currentNotifications,
    ]);
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    const savedProfile = localStorage.getItem("profile");
    const savedBalance = localStorage.getItem("balance");
    const savedTransactions = localStorage.getItem("transactions");
    const savedInvoices = localStorage.getItem("invoices");
    const savedNotifications = localStorage.getItem("notifications");

    if (savedTheme) setDarkMode(JSON.parse(savedTheme));
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedBalance) setBalance(Number(savedBalance));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    localStorage.setItem("profile", JSON.stringify(profile));
    localStorage.setItem("balance", String(balance));
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("invoices", JSON.stringify(invoices));
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [darkMode, profile, balance, transactions, invoices, notifications]);

  return (
    <AppContext.Provider
      value={{
        balance,
        setBalance,
        transactions,
        setTransactions,
        invoices,
        setInvoices,
        darkMode,
        setDarkMode,
        profile,
        setProfile,
        notifications,
        setNotifications,
        addNotification,
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