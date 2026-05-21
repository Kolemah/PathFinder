"use client";

import { jsPDF } from "jspdf";

import PageHeader from "../components/PageHeader";
import Card from "../components/card";
import Button from "../components/button";
import { useAppContext } from "../context/AppContext";

export default function InvoicesPage() {
  const {
    invoices,
    setInvoices,
    balance,
    setBalance,
    addNotification,
  } = useAppContext();

  function markAsPaid(id: number) {
    const invoice = invoices.find(
      (item) => item.id === id
    );

    if (!invoice) return;

    setInvoices(
      invoices.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Paid",
            }
          : item
      )
    );

    setBalance(
      balance + Number(invoice.amount)
    );

    addNotification(
      `${invoice.name} paid invoice $${invoice.amount}`
    );
  }

  function downloadPDF(invoice: any) {
    const doc = new jsPDF();

    doc.setFontSize(20);

    doc.text(
      "PathFinder Invoice",
      20,
      20
    );

    doc.setFontSize(12);

    doc.text(
      `Client: ${invoice.name}`,
      20,
      40
    );

    doc.text(
      `Email: ${invoice.gmail}`,
      20,
      50
    );

    doc.text(
      `Country: ${invoice.country}`,
      20,
      60
    );

    doc.text(
      `State: ${invoice.state}`,
      20,
      70
    );

    doc.text(
      `Address: ${invoice.address}`,
      20,
      80
    );

    doc.text(
      `Zip Code: ${invoice.zipcode}`,
      20,
      90
    );

    doc.text(
      `Description: ${invoice.description}`,
      20,
      100
    );

    doc.text(
      `Amount: $${invoice.amount}`,
      20,
      110
    );

    doc.text(
      `Status: ${invoice.status}`,
      20,
      120
    );

    doc.save(
      `${invoice.name}-invoice.pdf`
    );

    addNotification(
      `PDF downloaded for ${invoice.name}`
    );
  }

  return (
    <div className="page">
      <PageHeader title="Invoices" />

      {invoices.length === 0 ? (
        <Card>
          No invoices yet
        </Card>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection:
              "column",

            gap: 15,
          }}
        >
          {invoices.map(
            (invoice) => (
              <Card
                key={
                  invoice.id
                }
              >
                <div
                  style={{
                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    alignItems:
                      "flex-start",

                    flexWrap:
                      "wrap",

                    gap: 20,
                  }}
                >
                  <div>
                    <h3>
                      {
                        invoice.name
                      }
                    </h3>

                    <p>
                      <strong>
                        Gmail:
                      </strong>{" "}
                      {
                        invoice.gmail
                      }
                    </p>

                    <p>
                      <strong>
                        Country:
                      </strong>{" "}
                      {
                        invoice.country
                      }
                    </p>

                    <p>
                      <strong>
                        State:
                      </strong>{" "}
                      {
                        invoice.state
                      }
                    </p>

                    <p>
                      <strong>
                        Address:
                      </strong>{" "}
                      {
                        invoice.address
                      }
                    </p>

                    <p>
                      <strong>
                        Zip:
                      </strong>{" "}
                      {
                        invoice.zipcode
                      }
                    </p>

                    <p>
                      <strong>
                        Description:
                      </strong>{" "}
                      {
                        invoice.description
                      }
                    </p>

                    <p>
                      <strong>
                        Amount:
                      </strong>{" "}
                      $
                      {
                        invoice.amount
                      }
                    </p>

                    <p>
                      <strong>
                        Status:
                      </strong>{" "}
                      {
                        invoice.status
                      }
                    </p>
                  </div>

                  <div
                    style={{
                      display:
                        "flex",

                      flexDirection:
                        "column",

                      gap: 10,
                    }}
                  >
                    {invoice.status !==
                      "Paid" && (
                      <Button
                        onClick={() =>
                          markAsPaid(
                            invoice.id
                          )
                        }
                      >
                        Mark
                        as Paid
                      </Button>
                    )}

                    <Button
                      onClick={() =>
                        downloadPDF(
                          invoice
                        )
                      }
                    >
                      Download PDF
                    </Button>
                  </div>
                </div>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}