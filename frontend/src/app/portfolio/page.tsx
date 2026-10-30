import type { Metadata } from "next";
import { PortfolioGrid } from "@/components/portfolio-grid";

export const metadata: Metadata = { title: "Portfolio", description: "Explore concept projects that demonstrate Nexvora's approach to brand, web and digital product design." };

export default function PortfolioPage() {
  return (
    <>
      <section className="page-hero"><p className="eyebrow">Selected concepts</p><h1>Ideas, made<br /><span>tangible.</span></h1><p>A glimpse into how we think, shape and build. These concept explorations show the kind of thoughtful digital work we love to create.</p></section>
      <section className="section portfolio-section"><PortfolioGrid /><p className="concept-note"><span aria-hidden="true">✓</span> These are illustrative concepts created by Nexvora—not completed client projects.</p></section>
    </>
  );
}
