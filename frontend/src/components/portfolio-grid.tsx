"use client";

import { useState } from "react";
import { ProjectCard } from "@/components/project-card";
import { projectFilters, projects } from "@/lib/site-data";

export function PortfolioGrid() {
  const [filter, setFilter] = useState("All");
  const visible = filter === "All" ? projects : projects.filter((project) => project.category === filter);
  return (
    <>
      <div className="portfolio-filters" aria-label="Filter portfolio concepts">
        {projectFilters.map((item) => <button key={item} type="button" className={filter === item ? "filter-button filter-active" : "filter-button"} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}
      </div>
      <div className="project-grid portfolio-grid">{visible.map((project) => <ProjectCard key={project.name} project={project} />)}</div>
    </>
  );
}
