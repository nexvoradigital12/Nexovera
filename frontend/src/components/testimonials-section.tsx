const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  sort_order: number;
};

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const res = await fetch(`${apiUrl}/api/testimonials`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json() as { testimonials: Testimonial[] };
    return data.testimonials ?? [];
  } catch {
    return [];
  }
}

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="testimonials-section">
      <div className="section testimonials-inner">
        <div className="section-heading">
          <div>
            <p className="eyebrow">What clients say</p>
            <h2>Work that speaks<br /><span className="muted-heading">for itself.</span></h2>
          </div>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((t) => (
            <article key={t.id} className="testimonial-card">
              <span className="testimonial-mark" aria-hidden="true">❝</span>
              <blockquote className="testimonial-quote">{t.quote}</blockquote>
              <footer className="testimonial-footer">
                <strong>{t.name}</strong>
                {(t.role || t.company) && (
                  <span>{[t.role, t.company].filter(Boolean).join(", ")}</span>
                )}
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
