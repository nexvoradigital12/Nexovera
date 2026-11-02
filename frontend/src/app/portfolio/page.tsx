import type { Metadata } from "next";
import { PortfolioGrid } from "@/components/portfolio-grid";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Explore projects that demonstrate Nexvora's approach to brand, web and digital product design.",
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ApiProject = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  category: string;
  technologies: string[];
  live_url: string | null;
  featured: boolean;
  sort_order: number;
};

async function getProjects(): Promise<ApiProject[]> {
  try {
    const res = await fetch(`${apiUrl}/api/projects`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json() as { projects: ApiProject[] };
    return data.projects ?? [];
  } catch {
    return [];
  }
}

export default async function PortfolioPage() {
  const apiProjects = await getProjects();
  const hasApiData = apiProjects.length > 0;

  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">Selected {hasApiData ? "work" : "concepts"}</p>
        <h1>Ideas, made<br /><span>tangible.</span></h1>
        <p>A glimpse into how we think, shape and build. {hasApiData ? "Real projects built with purpose." : "These concept explorations show the kind of thoughtful digital work we love to create."}</p>
      </section>
      <section className="section portfolio-section">
        <PortfolioGrid apiProjects={apiProjects} />
        {!hasApiData && (
          <p className="concept-note">
            <span aria-hidden="true">✓</span> These are illustrative concepts created by Nexvora—not completed client projects.
          </p>
        )}
      </section>
    </>
  );
}
