import Link from "next/link";
import { notFound } from "next/navigation";
import LandingNavbar from "../../components/LandingNavbar";
import { getPolicy, policies } from "../policy-content";

type PolicyPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return policies.map((policy) => ({ slug: policy.slug }));
}

export async function generateMetadata({ params }: PolicyPageProps) {
  const { slug } = await params;
  const policy = getPolicy(slug);

  if (!policy) {
    return {
      title: "Policy not found | PathPayX",
    };
  }

  return {
    title: `${policy.title} | PathPayX`,
    description: policy.summary,
  };
}

export default async function PolicyDetailPage({ params }: PolicyPageProps) {
  const { slug } = await params;
  const policy = getPolicy(slug);

  if (!policy) {
    notFound();
  }

  return (
    <div className="landing-page">
      <LandingNavbar />

      <main className="policy-page policy-detail-page">
        <Link href="/policies" className="policy-back-link">
          Back to policies
        </Link>

        <article className="policy-article">
          <header>
            <span className="landing-eyebrow">Updated {policy.updated}</span>
            <h1>{policy.title}</h1>
            <p>{policy.summary}</p>
          </header>

          {policy.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </article>
      </main>
    </div>
  );
}
