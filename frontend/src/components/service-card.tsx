import type { Service } from "@/lib/site-data";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="service-card">
      <div className="service-card-top"><span className="service-number">{service.number}</span><span className="service-icon" aria-hidden="true">{service.icon}</span></div>
      <h3>{service.title}</h3><p>{service.description}</p>
      <div className="tag-list">{service.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
    </article>
  );
}
