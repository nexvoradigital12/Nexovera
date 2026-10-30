"use client";

import { useState } from "react";
import type { FormEvent } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function ContactForm() {
  const [state, setState] = useState<{ kind: "idle" | "sending" | "success" | "error"; message: string }>({ kind: "idle", message: "" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ kind: "sending", message: "" });
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch(`${apiUrl}/api/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(result?.error ?? "We couldn’t send your inquiry. Please try again.");
      }
      form.reset();
      setState({ kind: "success", message: "Thanks for getting in touch. Your project inquiry is on its way." });
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "Something went wrong. Please try again." });
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-grid">
        <label>Your name <span>*</span><input name="name" autoComplete="name" required maxLength={120} placeholder="Jane Smith" /></label>
        <label>Email address <span>*</span><input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="jane@company.com" /></label>
        <label>Phone number<input name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder="+1 (555) 000-0000" /></label>
        <label>Company<input name="company" autoComplete="organization" maxLength={160} placeholder="Your company" /></label>
        <label>What can we help with?<select name="service" defaultValue=""><option value="">Select a service</option><option>Web design & development</option><option>Digital strategy</option><option>Brand & experience</option><option>Custom applications</option><option>Growth & optimisation</option><option>Ongoing support</option><option>Something else</option></select></label>
        <label>Estimated budget<select name="budget" defaultValue=""><option value="">Choose a range</option><option>Under $2,500</option><option>$2,500–$5,000</option><option>$5,000–$10,000</option><option>$10,000–$25,000</option><option>$25,000+</option><option>Not sure yet</option></select></label>
        <label>Preferred timing<select name="deadline" defaultValue=""><option value="">Choose a timeframe</option><option>As soon as possible</option><option>Within 2–4 weeks</option><option>Within 1–3 months</option><option>Flexible</option><option>Just exploring</option></select></label>
      </div>
      <label>Tell us a little about your project <span>*</span><textarea name="message" required minLength={10} maxLength={5000} rows={5} placeholder="What are you building, and what would success look like?" /></label>
      <label className="honeypot" aria-hidden="true">Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <div className="form-submit"><button className="button button-primary" disabled={state.kind === "sending"} type="submit">{state.kind === "sending" ? "Sending…" : "Send your inquiry"} <span aria-hidden="true">↗</span></button><span>We’ll get back to you as soon as we can.</span></div>
      {state.message && <p className={`form-message ${state.kind}`} role="status">{state.message}</p>}
    </form>
  );
}
