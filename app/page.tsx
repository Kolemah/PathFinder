import Link from "next/link";
import Image from "next/image";
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
    title: "Client pays in USD",
    copy: "Receive payments from clients worldwide into your pending USD balance.",
  },
  {
    title: "Funds clear after 3 days",
    copy: "PathPayX deducts the 10% platform fee and converts the payout to naira.",
  },
  {
    title: "Withdraw in naira",
    copy: "Verified sellers can request payout from their available naira balance.",
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
    title: "Naira wallet",
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
            <span className="landing-eyebrow">Built for Nigerian freelancers</span>
            <h1>Invoice global clients. Receive USD. Withdraw in naira.</h1>
            <p>
              PathPayX helps freelancers send invoices, receive payments from
              clients worldwide, hold funds for buyer confirmation, and withdraw
              cleared earnings into a naira wallet.
            </p>

            <div className="landing-hero-pills" aria-label="PathPayX payment highlights">
              <span>Worldwide payments</span>
              <span>USD invoices</span>
              <span>3-day protection</span>
              <span>NGN payouts</span>
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
            <Image
              src="/pathpayx-landing-hero.png"
              alt="Nigerian freelancers using PathPayX to receive USD payments and withdraw in naira"
              width={1680}
              height={945}
              priority
            />
          </div>
        </section>

        <section className="landing-metrics" aria-label="PathPayX platform highlights">
          <div>
            <strong>3 days</strong>
            <span>buyer confirmation hold before funds clear</span>
          </div>
          <div>
            <strong>10%</strong>
            <span>platform fee calculated before naira release</span>
          </div>
          <div>
            <strong>₦10k</strong>
            <span>minimum payout for verified sellers</span>
          </div>
        </section>

        <section className="landing-product-showcase" aria-label="PathPayX dashboard preview">
          <div className="landing-showcase-copy">
            <span className="landing-eyebrow">Your money flow, visible</span>
            <h2>Track every invoice from payment link to payout.</h2>
            <p>
              Keep clients, pending USD, cleared naira, KYC status, and payout
              history in one calm dashboard.
            </p>
          </div>
          <Image
            src="/pathpayx-product-mockup.png"
            alt="PathPayX dashboard and mobile wallet preview"
            width={1680}
            height={945}
          />
        </section>

        <section id="how-it-works" className="landing-section">
          <div className="landing-section-heading">
            <span className="landing-eyebrow">How it works</span>
            <h2>From invoice to naira payout</h2>
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
      </main>
    </div>
  );
}

