"use client";

import { useState } from "react";
import { ProjectCard } from "@/components/project-card";
import { projectFilters, projects as fallbackProjects } from "@/lib/site-data";
import type { ApiProject } from "@/app/portfolio/page";

type Props = {
  apiProjects: ApiProject[];
};

export function PortfolioGrid({ apiProjects }: Props) {
  const hasApiData = apiProjects.length > 0;

  // Derive category filters from API data or fall back to static
  const categories = hasApiData
    ? ["All", ...Array.from(new Set(apiProjects.map((p) => p.category).filter(Boolean)))]
    : projectFilters;

  const [filter, setFilter] = useState("All");

  if (hasApiData) {
    const visible = filter === "All" ? apiProjects : apiProjects.filter((p) => p.category === filter);
    return (
      <>
        {categories.length > 2 && (
          <div className="portfolio-filters" aria-label="Filter portfolio projects">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={filter === item ? "filter-button filter-active" : "filter-button"}
                aria-pressed={filter === item}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        )}
        <div className="project-grid portfolio-grid">
          {visible.map((project) => (
            <ProjectCard
              key={project.id}
              project={{
                name: project.name,
                category: project.category,
                description: project.description || project.summary,
                palette: slugToPalette(project.slug),
                mark: project.name.slice(0, 2).toUpperCase(),
                tags: project.technologies ?? [],
              }}
            />
          ))}
        </div>
      </>
    );
  }

  // Static fallback
  const visible = filter === "All" ? fallbackProjects : fallbackProjects.filter((p) => p.category === filter);
  return (
    <>
      <div className="portfolio-filters" aria-label="Filter portfolio concepts">
        {projectFilters.map((item) => (
          <button
            key={item}
            type="button"
            className={filter === item ? "filter-button filter-active" : "filter-button"}
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="project-grid portfolio-grid">
        {visible.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
    </>
  );
}

// Map a slug to one of the existing CSS palette classes; cycle through them
const palettes = ["forma", "fieldnotes", "northline", "common"];
function slugToPalette(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return palettes[hash % palettes.length];
}
