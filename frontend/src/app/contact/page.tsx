import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = { title: "Contact", description: "Tell Nexvora about your project. We’ll help you find the right next step." };

export default function ContactPage() {
  return (
    <section className="contact-layout">
      <div className="contact-aside"><p className="eyebrow">Start a conversation</p><h1>Let’s make<br />something <span>matter.</span></h1><p>Tell us what you’re thinking. A rough idea, a big ambition or a question is a great place to start.</p><div className="contact-detail"><span>EMAIL US</span><a href="mailto:hello@nexvora.com">hello@nexvora.com ↗</a></div><div className="contact-detail"><span>WHAT HAPPENS NEXT</span><p>We’ll read through your note and get back to you to talk through the possibilities.</p></div></div>
      <div className="contact-form-wrap"><h2>Tell us about your project</h2><p>Fields marked <span>*</span> are required.</p><ContactForm /></div>
    </section>
  );
}
