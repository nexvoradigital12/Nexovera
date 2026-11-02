import type { Metadata } from "next";
import Link from "next/link";
import { ServiceCard } from "@/components/service-card";
import { services as fallbackServices } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Services",
  description: "Website development, digital strategy, brand design and ongoing support from Nexvora Digital Solutions.",
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ApiService = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  sort_order: number;
};

async function getServices(): Promise<ApiService[]> {
  try {
    const res = await fetch(`${apiUrl}/api/services`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json() as { services: ApiService[] };
    return data.services ?? [];
  } catch {
    return [];
  }
}

export default async function ServicesPage() {
  const apiServices = await getServices();

  // Use API data if available, otherwise fall back to static data
  const hasApiData = apiServices.length > 0;

  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">What we do</p>
        <h1>Digital solutions<br />with <span>direction.</span></h1>
        <p>Thoughtful strategy, purposeful design and dependable technology—brought together around your goals.</p>
      </section>

      <section className="section services-page-section">
        {hasApiData ? (
          <div className="service-grid services-grid-full">
            {apiServices.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={{
                  number: String(index + 1).padStart(2, "0"),
                  icon: ["↗", "✳", "◉", "⌘", "◎", "⟲"][index % 6],
                  title: service.title,
                  description: service.summary,
                  tags: [],
                }}
              />
            ))}
          </div>
        ) : (
          <div className="service-grid services-grid-full">
            {fallbackServices.map((service) => (
              <ServiceCard key={service.title} service={service} />
            ))}
          </div>
        )}
      </section>

      <section className="cta-section">
        <div>
          <p className="eyebrow">Not sure where to start?</p>
          <h2>Let's find the<br />right <span>next step.</span></h2>
        </div>
        <Link className="button button-primary" href="/contact">
          Talk through your idea <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </>
  );
}
