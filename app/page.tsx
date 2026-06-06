import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  FileText,
  Globe2,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import LandingNavbar from "./components/LandingNavbar";
import LandingRateCard from "./components/LandingRateCard";

const workflow = [
  {
    title: "Create invoice",
    copy: "Send a professional invoice and payment link to your client in minutes.",
  },
  {
    title: "Client pays in their currency",
    copy: "Receive payments from clients worldwide in supported currencies.",
  },
  {
    title: "Funds clear after 3 days",
    copy: "PathPayX deducts the 10% platform fee and prepares the payout after buyer confirmation.",
  },
  {
    title: "Withdraw your payout",
    copy: "Verified sellers can request payout from their available balance.",
  },
];

const features = [
  {
    title: "Invoice payment links",
    copy: "Share a clean link your client can open and pay from anywhere.",
    Icon: FileText,
  },
  {
    title: "Pending balance",
    copy: "See exactly which paid invoices are still in the 3-day hold period.",
    Icon: Clock3,
  },
  {
    title: "Seller wallet",
    copy: "Track cleared earnings, payouts, and transaction history in one wallet.",
    Icon: Wallet,
  },
  {
    title: "KYC-protected payouts",
    copy: "Withdrawal is locked until seller identity verification is complete.",
    Icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <div className="landing-page">
      <LandingNavbar />

      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="landing-eyebrow">Built for African freelancers</span>
            <h1>Invoice global clients. Withdraw with confidence.</h1>
            <p>
              PathPayX helps freelancers send invoices, receive payments from
              clients worldwide, hold funds for buyer confirmation, and withdraw
              cleared earnings from one simple wallet.
            </p>

            <div className="landing-hero-pills" aria-label="PathPayX payment highlights">
              <span>Worldwide payments</span>
              <span>Multi-currency invoices</span>
              <span>3-day protection</span>
              <span>Seller payouts</span>
            </div>

            <div className="landing-hero-actions">
              <Link href="/register" className="landing-primary">
                Create free account <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="landing-secondary">
                Sign in
              </Link>
            </div>
          </div>

          <div className="landing-hero-image">
            <LandingRateCard />
            <div className="landing-hero-visual" aria-label="PathPayX global payment preview">
              <div className="landing-hero-panel landing-hero-panel-left">
                <span>Invoice sent</span>
                <strong>Client invoice</strong>
                <p>Payment link ready</p>
              </div>
              <div className="landing-hero-people">
                <div>
                  <span>Global client</span>
                  <strong>Payment received</strong>
                </div>
                <div>
                  <span>Seller wallet</span>
                  <strong>Funds pending</strong>
                </div>
              </div>
              <div className="landing-hero-panel landing-hero-panel-right">
                <span>Multi-currency</span>
                <strong>Multiple currencies</strong>
                <p>More supported currencies coming</p>
              </div>
              <div className="landing-hero-panel landing-hero-panel-bottom">
                <span>Payout status</span>
                <strong>Ready after confirmation</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-metrics" aria-label="PathPayX platform highlights">
          <div>
            <strong>3 days</strong>
            <span>buyer confirmation hold before funds clear</span>
          </div>
          <div>
            <strong>10%</strong>
            <span>platform fee calculated before payout release</span>
          </div>
          <div>
            <strong>KYC</strong>
            <span>verified sellers can request payouts</span>
          </div>
        </section>

        <section className="landing-product-showcase" aria-label="PathPayX dashboard preview">
          <div className="landing-showcase-copy">
            <span className="landing-eyebrow">Your money flow, visible</span>
            <h2>Track every invoice from payment link to payout.</h2>
            <p>
              Keep clients, pending payments, cleared earnings, KYC status, and payout
              history in one calm dashboard.
            </p>
          </div>
          <div className="landing-product-mockup" aria-label="PathPayX dashboard and mobile wallet preview">
            <div className="landing-mockup-desktop">
              <aside>
                <strong>PathPayX</strong>
                <span>Dashboard</span>
                <span>Invoices</span>
                <span>Clients</span>
                <span>Transactions</span>
                <span>Wallet</span>
              </aside>
              <div className="landing-mockup-main">
                <div>
                  <span>Welcome back,</span>
                  <h3>John Adewumi</h3>
                </div>
                <div className="landing-mockup-stats">
                  <article>
                    <span>Invoice paid</span>
                    <strong>24</strong>
                  </article>
                  <article>
                    <span>Pending balance</span>
                    <strong>$1,250.00</strong>
                  </article>
                  <article>
                    <span>Available balance</span>
                    <strong>Ready</strong>
                  </article>
                </div>
                <div className="landing-mockup-table">
                  <strong>Recent transactions</strong>
                  <span>Invoice #INV-1003 paid</span>
                  <span>Invoice #INV-1002 paid</span>
                  <span>Payout requested</span>
                </div>
              </div>
            </div>

            <div className="landing-mockup-phone">
              <strong>PathPayX</strong>
              <article>
                <span>Invoice paid</span>
                <b>24</b>
              </article>
              <article>
                <span>Pending balance</span>
                <b>$1,250.00</b>
              </article>
              <article>
                <span>Available balance</span>
                <b>Ready</b>
              </article>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="landing-section">
          <div className="landing-section-heading">
            <span className="landing-eyebrow">How it works</span>
            <h2>From invoice to payout</h2>
          </div>

          <div className="landing-workflow">
            {workflow.map((item, index) => (
              <div key={item.title} className="landing-workflow-card">
                <span>{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="landing-section landing-feature-band">
          <div className="landing-section-heading">
            <span className="landing-eyebrow">Features</span>
            <h2>Everything your freelance payment flow needs</h2>
          </div>

          <div className="landing-features">
            {features.map(({ title, copy, Icon }) => (
              <div key={title} className="landing-feature-card">
                <span>
                  <Icon size={24} />
                </span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="trust" className="landing-trust">
          <div>
            <span className="landing-eyebrow">Trust and protection</span>
            <h2>Clear records for sellers and buyers</h2>
            <p>
              Every paid invoice creates a payment record, stays visible in
              wallet history, and only becomes withdrawable after the buyer
              confirmation period.
            </p>
          </div>

          <ul>
            <li>
              <BadgeCheck size={20} /> 3-day buyer confirmation hold
            </li>
            <li>
              <TrendingUp size={20} /> Live exchange-rate ready wallet math
            </li>
            <li>
              <Globe2 size={20} /> Receive client payments across the world
            </li>
            <li>
              <ShieldCheck size={20} /> Smile ID-ready seller verification
            </li>
          </ul>
        </section>

        <section className="landing-final-cta">
          <h2>Start sending invoices with confidence.</h2>
          <Link href="/register" className="landing-primary">
            Get started <ArrowRight size={18} />
          </Link>
        </section>

        <footer className="landing-footer">
          <span>PathPayX</span>
          <nav aria-label="PathPayX policy links">
            <Link href="/policies/terms">Terms</Link>
            <Link href="/policies/privacy">Privacy</Link>
            <Link href="/policies/refunds">Refunds</Link>
            <Link href="/policies/kyc-aml">KYC & AML</Link>
          </nav>
        </footer>
      </main>
    </div>
  );
}

