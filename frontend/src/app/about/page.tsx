import type { Metadata } from "next";
import Link from "next/link";
import { TestimonialsSection, getTestimonials } from "@/components/testimonials-section";

export const metadata: Metadata = { title: "About", description: "Meet Nexvora Digital Solutions: a thoughtful digital partner for ambitious ideas." };

export default async function AboutPage() {
  const testimonials = await getTestimonials();
  return (
    <>
      <section className="page-hero"><p className="eyebrow">A little about us</p><h1>Good work starts<br />with <span>good people.</span></h1><p>Nexvora is an independent digital studio for people building something meaningful. We make the complex feel clear—and the next step feel possible.</p></section>
      <section className="section about-story"><div className="about-statement"><span className="statement-mark">✳</span><p>We believe the best digital work is more than good-looking. It's useful, considered and made to move your business forward.</p></div><div className="about-copy"><p className="eyebrow">How we think</p><h2>Less noise.<br /><span className="muted-heading">More meaningful work.</span></h2><p>We bring a practical, collaborative mindset to every project. That means listening closely, asking better questions and being deliberate about every decision—from the first conversation to the final details.</p><p>We keep our team intentionally close to the work, so you get thoughtful expertise, direct communication and a digital partner who cares about where you're headed.</p></div></section>
      <section className="values-section"><div className="section-heading"><div><p className="eyebrow">What guides us</p><h2>Principles over<br /><span className="muted-heading">promises.</span></h2></div></div><div className="values-grid"><article><span>01 / Be curious</span><h3>Understand first.</h3><p>Good questions help us find the real opportunity—not just the obvious answer.</p></article><article><span>02 / Make it matter</span><h3>Focus on the useful.</h3><p>Every interaction, pixel and line of code should have a reason to be there.</p></article><article><span>03 / Make it together</span><h3>Stay human.</h3><p>Open conversations and shared ownership make better outcomes possible.</p></article></div></section>
      <TestimonialsSection testimonials={testimonials} />
      <section className="cta-section"><div><p className="eyebrow">Looking for a digital partner?</p><h2>We'd love to hear<br />what you're <span>building.</span></h2></div><Link className="button button-primary" href="/contact">Start a conversation <span aria-hidden="true">↗</span></Link></section>
    </>
  );
}
