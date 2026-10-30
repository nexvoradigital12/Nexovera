import type { Project } from "@/lib/site-data";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      <div className={`project-visual visual-${project.palette}`} aria-label={`${project.name} concept preview`}>
        <div className="visual-topline"><span>NEXVORA® / CONCEPT</span><span>2025</span></div>
        <div className="visual-center"><span className="visual-mark">{project.mark.split("\n").map((line) => <span key={line}>{line}</span>)}</span><span className="visual-caption">{project.category.toUpperCase()} — DIGITAL CONCEPT</span></div>
        <span className="visual-orbit" aria-hidden="true" />
      </div>
      <div className="project-meta"><div><span className="project-category">{project.category} <span>·</span> Concept</span><h3>{project.name}</h3><p>{project.description}</p></div><span className="project-arrow" aria-hidden="true">↗</span></div>
      <div className="project-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
    </article>
  );
}
