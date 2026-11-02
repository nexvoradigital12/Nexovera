"use client";

import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AdminBlogPanel } from "./admin-blog-panel";

// Re-export inquiry panel inline so we don't duplicate auth logic
type Tab = "inquiries" | "blog";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  budget: string;
  deadline: string;
  message: string;
  status: "new" | "in_progress" | "contacted" | "closed";
  created_at: string;
};

const statuses: Inquiry["status"][] = ["new", "in_progress", "contacted", "closed"];

function InquiriesPanel({ token }: { token: string }) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    fetch(`${apiUrl}/api/inquiries`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json() as Promise<{ inquiries?: Inquiry[]; error?: string }>)
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setInquiries(data.inquiries ?? []);
      })
      .catch((err: unknown) => setMessage(err instanceof Error ? err.message : "Could not load inquiries."))
      .finally(() => setLoading(false));
  }, [token]);

  async function updateStatus(id: string, status: Inquiry["status"]) {
    setBusyId(id);
    setMessage("");
    try {
      const res = await fetch(`${apiUrl}/api/inquiries/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not update inquiry.");
      setInquiries((cur) => cur.map((i) => (i.id === id ? { ...i, status } : i)));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not update inquiry.");
    } finally {
      setBusyId("");
    }
  }

  const newCount = inquiries.filter((i) => i.status === "new").length;

  return (
    <section className="admin-section">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Nexvora workspace</p>
          <h1>Project inquiries</h1>
          <p>Review and update incoming project requests.</p>
        </div>
      </div>
      <div className="admin-stats">
        <article><span>Total inquiries</span><strong>{inquiries.length}</strong></article>
        <article><span>New inquiries</span><strong>{newCount}</strong></article>
        <article><span>Needs follow-up</span><strong>{inquiries.filter((i) => i.status === "in_progress").length}</strong></article>
      </div>
      {message && <p className="admin-message" role="status">{message}</p>}
      {loading ? (
        <p className="admin-empty">Loading inquiries…</p>
      ) : inquiries.length === 0 ? (
        <p className="admin-empty">No inquiries yet. New requests will appear here.</p>
      ) : (
        <div className="admin-inquiries">
          {inquiries.map((inquiry) => (
            <article className="admin-inquiry" key={inquiry.id}>
              <div className="inquiry-top">
                <div>
                  <span className="inquiry-date">{new Date(inquiry.created_at).toLocaleDateString()}</span>
                  <h2>{inquiry.name}</h2>
                  <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                </div>
                <select
                  aria-label={`Update status for ${inquiry.name}`}
                  value={inquiry.status}
                  disabled={busyId === inquiry.id}
                  onChange={(e) => {
                    const s = statuses.find((x) => x === e.target.value);
                    if (s) void updateStatus(inquiry.id, s);
                  }}
                >
                  {statuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>
              </div>
              <div className="inquiry-details">
                <span>{inquiry.company || "Independent"}</span>
                <span>{inquiry.service || "Service not specified"}</span>
                <span>{inquiry.budget || "Budget not specified"}</span>
                <span>{inquiry.deadline || "Timing not specified"}</span>
                {inquiry.phone && <span>{inquiry.phone}</span>}
              </div>
              <p className="inquiry-message">{inquiry.message}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Main shell ────────────────────────────────────────────────────────────────

export function AdminShell() {
  const [supabase] = useState<SupabaseClient | null>(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return url && key ? createClient(url, key) : null;
  });
  const [session, setSession] = useState<Session | null>(null);
  const [tab, setTab] = useState<Tab>("inquiries");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(Boolean(supabase));
  const [message, setMessage] = useState(
    supabase ? "" : "Admin sign-in is not configured. Add the public Supabase URL and anon key to the frontend environment."
  );

  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) setLoading(false);
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) { setMessage(error.message); setLoading(false); return; }
      setSession(data.session);
      setLoading(false);
    }).catch((err: unknown) => {
      setMessage(err instanceof Error ? err.message : "Could not restore your session.");
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setMessage(error.message); setLoading(false); }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not sign in.");
      setLoading(false);
    }
  }

  async function signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) setMessage(error.message);
  }

  if (!session) {
    return (
      <section className="admin-login">
        <div className="admin-login-card">
          <span className="admin-lock" aria-hidden="true">✳</span>
          <p className="eyebrow">Nexvora workspace</p>
          <h1>Administrator sign in</h1>
          <p>Sign in with the administrator account configured in Supabase Auth.</p>
          <form onSubmit={signIn}>
            <label>Email address<input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
            <button className="button button-primary" disabled={loading || !supabase} type="submit">
              {loading ? "Please wait…" : "Sign in"} <span aria-hidden="true">↗</span>
            </button>
          </form>
          {message && <p className="admin-message" role="status">{message}</p>}
        </div>
      </section>
    );
  }

  const token = session.access_token;

  return (
    <div className="admin-shell">
      <div className="admin-shell-header">
        <nav className="admin-tabs" aria-label="Admin sections">
          <button
            type="button"
            className={tab === "inquiries" ? "admin-tab admin-tab-active" : "admin-tab"}
            onClick={() => setTab("inquiries")}
          >
            Inquiries
          </button>
          <button
            type="button"
            className={tab === "blog" ? "admin-tab admin-tab-active" : "admin-tab"}
            onClick={() => setTab("blog")}
          >
            Blog
          </button>
        </nav>
        <button className="admin-signout" type="button" onClick={signOut}>
          Sign out ↗
        </button>
      </div>

      {tab === "inquiries" && <InquiriesPanel token={token} />}
      {tab === "blog" && <AdminBlogPanel token={token} />}
    </div>
  );
}
