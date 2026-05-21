"use client";

import { useState } from "react";
import { Country, State } from "country-state-city";
import { useAppContext } from "../context/AppContext";
import Button from "./button";

const countries = Country.getAllCountries();

export default function InvoiceForm({
  onCreate,
}: {
  onCreate: (invoice: any) => void;
}) {
  const { darkMode } = useAppContext();

  const [name, setName] = useState("");
  const [gmail, setGmail] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const selectedCountry = countries.find(
    (item) => item.name === country
  );

  const states = selectedCountry
    ? State.getStatesOfCountry(selectedCountry.isoCode)
    : [];

  function handleSubmit() {
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
      alert("Please fill all invoice details");
      return;
    }

    onCreate({
      id: Date.now(),
      name,
      gmail,
      country,
      state,
      address,
      zipcode,
      description,
      amount: Number(amount),
      status: "Pending",
    });

    setName("");
    setGmail("");
    setCountry("");
    setState("");
    setAddress("");
    setZipcode("");
    setDescription("");
    setAmount("");
  }

  return (
    <div
      style={{
        background: darkMode ? "#0f172a" : "white",
        color: darkMode ? "white" : "#0f172a",
        padding: 24,
        borderRadius: 16,
        marginTop: 30,
        maxWidth: 500,
        width: "100%",
        border: darkMode ? "1px solid #334155" : "none",
      }}
    >
      <h2>Create Invoice</h2>

      <input
        placeholder="Client Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle(darkMode)}
      />

      <input
        placeholder="Client Gmail"
        type="email"
        value={gmail}
        onChange={(e) => setGmail(e.target.value)}
        style={inputStyle(darkMode)}
      />

      <input
        list="countries"
        placeholder="Country"
        value={country}
        onChange={(e) => {
          setCountry(e.target.value);
          setState("");
        }}
        style={inputStyle(darkMode)}
      />

      <datalist id="countries">
        {countries.map((countryItem) => (
          <option
            key={countryItem.isoCode}
            value={countryItem.name}
          />
        ))}
      </datalist>

      <input
        list="states"
        placeholder="State"
        value={state}
        onChange={(e) => setState(e.target.value)}
        style={inputStyle(darkMode)}
      />

      <datalist id="states">
        {states.map((stateItem) => (
          <option
            key={stateItem.isoCode}
            value={stateItem.name}
          />
        ))}
      </datalist>

      <input
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        style={inputStyle(darkMode)}
      />

      <input
        placeholder="Zip Code"
        value={zipcode}
        onChange={(e) => setZipcode(e.target.value)}
        style={inputStyle(darkMode)}
      />
      
<textarea
  placeholder="Payment Description (Website Design, Logo Design, FiveM Development...)"
  value={description}
  onChange={(e) =>
    setDescription(e.target.value)
  }
  style={{
    ...inputStyle(darkMode),
    minHeight: 100,
    resize: "vertical",
  }}
/>

      <input
        placeholder="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={inputStyle(darkMode)}
      />

      <div style={{ marginTop: 15 }}>
        <Button onClick={handleSubmit}>Create Invoice</Button>
      </div>
    </div>
  );
}

function inputStyle(darkMode: boolean): React.CSSProperties {
  return {
    display: "block",
    width: "100%",
    padding: 10,
    marginTop: 12,
    borderRadius: 8,
    border: darkMode ? "1px solid #475569" : "1px solid #ccc",
    background: darkMode ? "#1e293b" : "white",
    color: darkMode ? "white" : "#0f172a",
    boxSizing: "border-box",
  };
}