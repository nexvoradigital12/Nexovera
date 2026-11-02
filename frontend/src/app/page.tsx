import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { ServiceCard } from "@/components/service-card";
import { projects, services } from "@/lib/site-data";
import { TestimonialsSection, getTestimonials } from "@/components/testimonials-section";

export default async function Home() {
  const testimonials = await getTestimonials();
  return (
    <>
      <section className="hero-section">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span className="status-dot" /> Independent digital studio · Available for select projects</p>
            <h1>Digital that<br />moves you <span>forward.</span></h1>
            <p className="hero-description">We build thoughtful websites and digital experiences that turn ambitious ideas into measurable momentum.</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/contact">Start your project <span aria-hidden="true">↗</span></Link>
              <Link className="text-link" href="/portfolio">Explore our work <span aria-hidden="true">↗</span></Link>
            </div>
            <div className="hero-proof"><div className="avatar-stack" aria-hidden="true"><span>N</span><span>+</span><span>↗</span></div><p>Strategy-minded. Detail-obsessed.<br /><strong>Built around your next big move.</strong></p></div>
          </div>
          <div className="hero-art" aria-label="Abstract Nexvora digital orbit illustration">
            <div className="art-glow" /><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" />
            <div className="orbit-core"><span className="core-spark">✳</span><span className="core-wordmark">n<span>✳</span></span><small>IDEAS IN MOTION</small></div>
            <div className="orbit-chip chip-web"><span className="chip-icon">⌘</span><span>Digital products<small>Designed to perform</small></span></div>
            <div className="orbit-chip chip-growth"><span className="growth-mark">↗</span><span>Built for growth<small>Made to make a mark</small></span></div>
            <span className="art-star star-one">✳</span><span className="art-star star-two">✦</span>
          </div>
        </div>
        <div className="hero-bottom"><span>Scroll to discover</span><span className="scroll-line" /><span>01 — 04</span></div>
      </section>
      <section className="section section-services" id="services">
        <div className="section-heading"><div><p className="eyebrow">What we do</p><h2>Good ideas deserve<br /><span className="muted-heading">great execution.</span></h2></div><p className="section-intro">From first sketch to final launch, we bring strategy, design and technology together to make the digital work that makes a difference.</p></div>
        <div className="service-grid">{services.slice(0, 3).map((service) => <ServiceCard key={service.title} service={service} />)}</div>
        <Link className="arrow-link" href="/services">All services <span aria-hidden="true">↗</span></Link>
      </section>
      <section className="section work-section">
        <div className="section-heading work-heading"><div><p className="eyebrow">Selected concepts</p><h2>Made with purpose.<br /><span className="muted-heading">Built to stand out.</span></h2></div><Link className="arrow-link" href="/portfolio">View portfolio <span aria-hidden="true">↗</span></Link></div>
        <div className="project-grid">{projects.slice(0, 2).map((project) => <ProjectCard key={project.name} project={project} />)}</div>
        <p className="concept-note"><span aria-hidden="true">✓</span> Concept work created to demonstrate our approach. Not client engagements.</p>
      </section>
      <section className="section approach-section"><div className="approach-panel">
        <div className="approach-copy"><p className="eyebrow">The Nexvora difference</p><h2>Small team.<br /><span className="muted-heading">Big-picture thinking.</span></h2><p>Clear communication, considered decisions and a close-knit team invested in the details. That’s how we make digital feel a little more human.</p><Link className="button button-dark" href="/about">Get to know us <span aria-hidden="true">↗</span></Link></div>
        <div className="approach-points"><div><span>01</span><p><strong>Clarity before code</strong><small>We start with what matters to your business and your audience.</small></p></div><div><span>02</span><p><strong>Craft in every detail</strong><small>Distinctive design, thoughtful content and technology that fits.</small></p></div><div><span>03</span><p><strong>Built for what’s next</strong><small>Flexible foundations that can grow as your ambitions do.</small></p></div></div>
      </div></section>
      <TestimonialsSection testimonials={testimonials} />
      <section className="cta-section"><div><p className="eyebrow">Have a good one in mind?</p><h2>Let’s make your<br />next move <span>matter.</span></h2></div><Link className="button button-primary" href="/contact">Tell us about it <span aria-hidden="true">↗</span></Link></section>
    </>
  );
}