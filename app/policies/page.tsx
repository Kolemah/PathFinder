import Link from "next/link";
import LandingNavbar from "../components/LandingNavbar";
import { policies } from "./policy-content";

export default function PoliciesPage() {
  return (
    <div className="landing-page">
      <LandingNavbar />

      <main className="policy-page">
        <section className="policy-hero">
          <span className="landing-eyebrow">PathPayX policies</span>
          <h1>Platform rules, privacy, refunds, and verification.</h1>
          <p>
            These policies explain how PathPayX handles seller accounts,
            invoices, payments, payout holds, identity verification, and user
            data.
          </p>
        </section>

        <section className="policy-grid" aria-label="PathPayX policy pages">
          {policies.map((policy) => (
            <Link
              href={`/policies/${policy.slug}`}
              className="policy-card"
              key={policy.slug}
            >
              <span>{policy.updated}</span>
              <h2>{policy.title}</h2>
              <p>{policy.summary}</p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
