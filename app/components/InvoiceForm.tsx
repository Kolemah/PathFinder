"use client";

import { useState } from "react";
import { Country, State } from "country-state-city";
import { useAppContext } from "../context/AppContext";
import Button from "./button";
import {
  DEFAULT_INVOICE_CURRENCY,
  formatCurrency,
  invoiceCurrencies,
} from "@/lib/wallet";

const countries = Country.getAllCountries();
const requiredMark = <span className="required-mark">*</span>;

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
  currency: string;
  status: string;
  createdAt?: string;
  dueDate?: string;
};

export default function InvoiceForm({
  onCreate,
}: {
  onCreate: (invoice: Invoice) => void;
}) {
  const { currentUser, darkMode, showToast } = useAppContext();

  const [name, setName] = useState("");
  const [gmail, setGmail] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(DEFAULT_INVOICE_CURRENCY);
  const [loading, setLoading] = useState(false);

  const selectedCountry = countries.find(
    (item) => item.name === country
  );

  const states = selectedCountry
    ? State.getStatesOfCountry(selectedCountry.isoCode)
    : [];
  const accountRestricted = currentUser?.accountStatus === "Restricted";

  async function handleSubmit() {
    try {
      if (currentUser && !currentUser.emailVerified) {
        showToast("Please verify your email before creating invoices", "error");
        return;
      }

      if (accountRestricted) {
        showToast(
          "Your account is restricted. You cannot create invoices at this time.",
          "error"
        );
        return;
      }

      if (
        !name ||
        !gmail ||
        !country ||
        !state ||
        !address ||
        !zipcode ||
        !description ||
        !amount
      ) {
        showToast("Please fill all invoice details", "error");
        return;
      }

      const savedUser = localStorage.getItem("pathfinderUser");

      if (!savedUser) {
        showToast("Please log in again", "error");
        return;
      }

      const user = JSON.parse(savedUser);

      if (!user.emailVerified) {
        showToast("Please verify your email before creating invoices", "error");
        return;
      }

      setLoading(true);

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          name,
          gmail,
          country,
          state,
          address,
          zipcode,
          description,
          amount,
          currency,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Failed to create invoice", "error");
        return;
      }

      onCreate({
        id: data.invoice.id,
        name: data.invoice.customer.name,
        gmail: data.invoice.customer.email,
        country: data.invoice.customer.country,
        state: data.invoice.customer.state,
        address: data.invoice.customer.address,
        zipcode: data.invoice.customer.zipcode,
        description: data.invoice.description,
        amount: data.invoice.amount,
        currency: data.invoice.currency,
        status: data.invoice.status,
        createdAt: data.invoice.createdAt,
        dueDate: data.invoice.dueDate,
      });

      setName("");
      setGmail("");
      setCountry("");
      setState("");
      setAddress("");
      setZipcode("");
      setDescription("");
      setAmount("");
      setCurrency(DEFAULT_INVOICE_CURRENCY);

      showToast("Invoice created successfully", "success");
    } catch (error) {
      console.error(error);
      showToast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="invoice-create-panel"
      style={{
        background: darkMode ? "#111827" : "white",
        color: darkMode ? "white" : "#0f172a",
        padding: 0,
        borderRadius: 8,
        marginTop: 0,
        width: "100%",
        border: darkMode ? "1px solid #334155" : "1px solid #dbe4ee",
      }}
    >
      <div className="invoice-create-header">
        <div>
          <span className="metric-label">Invoice Workspace</span>
          <h2>Create Invoice</h2>
          <p className="empty-copy">
            Build a payable invoice for a client. New invoices are due in 3
            days by default.
          </p>
        </div>
      </div>

      {currentUser && !currentUser.emailVerified ? (
        <div className="auth-notice auth-notice-error invoice-email-lock">
          Verify your email address before creating invoices.
        </div>
      ) : null}

      {accountRestricted ? (
        <div className="auth-notice auth-notice-error invoice-email-lock">
          Your account is restricted. You cannot create invoices at this time.
        </div>
      ) : null}

      <div className="invoice-create-grid">
        <label>
          <span>Client Name {requiredMark}</span>
          <input
            placeholder="Client name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle(darkMode)}
            required
          />
        </label>

        <label>
          <span>Client Email {requiredMark}</span>
          <input
            placeholder="client@example.com"
            type="email"
            value={gmail}
            onChange={(e) => setGmail(e.target.value)}
            style={inputStyle(darkMode)}
            required
          />
        </label>

        <label>
          <span>Country {requiredMark}</span>
          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setState("");
            }}
            style={inputStyle(darkMode)}
            required
          >
            <option value="">Select country</option>
            {countries.map((countryItem) => (
              <option
                key={countryItem.isoCode}
                value={countryItem.name}
              >
                {countryItem.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>State {requiredMark}</span>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            style={inputStyle(darkMode)}
            disabled={!country}
            required
          >
            <option value="">
              {country ? "Select state" : "Select country first"}
            </option>
            {states.map((stateItem) => (
              <option
                key={stateItem.isoCode}
                value={stateItem.name}
              >
                {stateItem.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Address {requiredMark}</span>
          <input
            placeholder="Street address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={inputStyle(darkMode)}
            required
          />
        </label>

        <label>
          <span>Zip Code {requiredMark}</span>
          <input
            placeholder="Zip code"
            value={zipcode}
            onChange={(e) => setZipcode(e.target.value)}
            style={inputStyle(darkMode)}
            required
          />
        </label>

        <label className="invoice-create-description">
          <span>Payment Description {requiredMark}</span>
          <textarea
            placeholder="Website design, logo design, FiveM development..."
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            required
            style={{
              ...inputStyle(darkMode),
              minHeight: 110,
              resize: "vertical",
            }}
          />
        </label>

        <label>
          <span>Currency {requiredMark}</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={inputStyle(darkMode)}
            required
          >
            {invoiceCurrencies.map((currencyItem) => (
              <option key={currencyItem.code} value={currencyItem.code}>
                {currencyItem.name} ({currencyItem.code})
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Amount ({currency}) {requiredMark}</span>
          <div className="amount-input-wrap">
            <span>{formatCurrency(0, currency).replace(/[0-9.,\s]/g, "")}</span>
            <input
              placeholder="0.00"
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={inputStyle(darkMode)}
              required
            />
          </div>
        </label>
      </div>

      <div className="invoice-create-actions">
        <Button
          onClick={handleSubmit}
          disabled={
            loading ||
            accountRestricted ||
            Boolean(currentUser && !currentUser.emailVerified)
          }
        >
          {loading ? "Creating..." : "Create Invoice"}
        </Button>
      </div>
    </div>
  );
}

function inputStyle(darkMode: boolean): React.CSSProperties {
  return {
    display: "block",
    width: "100%",
    padding: 12,
    marginTop: 0,
    borderRadius: 8,
    border: darkMode ? "1px solid #475569" : "1px solid #dbe4ee",
    background: darkMode ? "#1e293b" : "#f8fafc",
    color: darkMode ? "white" : "#0f172a",
    boxSizing: "border-box",
    minHeight: 48,
  };
}
