import type { Metadata } from "next";
import Link from "next/link";
import { ServiceCard } from "@/components/service-card";
import { services } from "@/lib/site-data";

export const metadata: Metadata = { title: "Services", description: "Website development, digital strategy, brand design and ongoing support from Nexvora Digital Solutions." };

export default function ServicesPage() {
  return (
    <>
      <section className="page-hero"><p className="eyebrow">What we do</p><h1>Digital solutions<br />with <span>direction.</span></h1><p>Thoughtful strategy, purposeful design and dependable technology—brought together around your goals.</p></section>
      <section className="section services-page-section"><div className="service-grid services-grid-full">{services.map((service) => <ServiceCard key={service.title} service={service} />)}</div></section>
      <section className="cta-section"><div><p className="eyebrow">Not sure where to start?</p><h2>Let’s find the<br />right <span>next step.</span></h2></div><Link className="button button-primary" href="/contact">Talk through your idea <span aria-hidden="true">↗</span></Link></section>
    </>
  );
}
