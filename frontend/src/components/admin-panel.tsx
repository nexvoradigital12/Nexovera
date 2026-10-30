"use client";

import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

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

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const statuses: Inquiry["status"][] = ["new", "in_progress", "contacted", "closed"];

export function AdminPanel() {
  const [supabase] = useState<SupabaseClient | null>(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return url && key ? createClient(url, key) : null;
  });
  const [session, setSession] = useState<Session | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(Boolean(supabase));
  const [message, setMessage] = useState(supabase ? "" : "Admin sign-in is not configured. Add the public Supabase URL and anon key to the frontend environment.");
  const [busyId, setBusyId] = useState("");

  const loadInquiries = useCallback(async (token: string) => {
    const response = await fetch(`${apiUrl}/api/inquiries`, { headers: { Authorization: `Bearer ${token}` } });
    const result = await response.json() as { inquiries?: Inquiry[]; error?: string };
    if (!response.ok) throw new Error(result.error ?? "Could not load inquiries.");
    setInquiries(result.inquiries ?? []);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        setLoading(true);
      } else {
        setInquiries([]);
        setLoading(false);
      }
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }
      setSession(data.session);
      setLoading(Boolean(data.session));
    }).catch((error: unknown) => {
      setMessage(error instanceof Error ? error.message : "Could not restore your session.");
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!session) return;
    loadInquiries(session.access_token)
      .then(() => setMessage(""))
      .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Could not load inquiries."))
      .finally(() => setLoading(false));
  }, [session, loadInquiries]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
        setLoading(false);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sign in.");
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: Inquiry["status"]) {
    if (!session) return;
    setBusyId(id);
    setMessage("");
    try {
      const response = await fetch(`${apiUrl}/api/inquiries/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not update inquiry.");
      setInquiries((current) => current.map((inquiry) => inquiry.id === id ? { ...inquiry, status } : inquiry));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update inquiry.");
    } finally {
      setBusyId("");
    }
  }

  async function signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) setMessage(error.message);
  }

  if (!session) {
    return <section className="admin-login">
      <div className="admin-login-card"><span className="admin-lock" aria-hidden="true">✳</span><p className="eyebrow">Nexvora workspace</p><h1>Administrator sign in</h1><p>Sign in with the administrator account configured in Supabase Auth.</p>
        <form onSubmit={signIn}><label>Email address<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label><button className="button button-primary" disabled={loading || !supabase} type="submit">{loading ? "Please wait…" : "Sign in"} <span aria-hidden="true">↗</span></button></form>
        {message && <p className="admin-message" role="status">{message}</p>}
      </div>
    </section>;
  }

  const newCount = inquiries.filter((inquiry) => inquiry.status === "new").length;
  return <section className="admin-section">
    <div className="admin-heading"><div><p className="eyebrow">Nexvora workspace</p><h1>Project inquiries</h1><p>Review and update incoming project requests.</p></div><button className="admin-signout" type="button" onClick={signOut}>Sign out ↗</button></div>
    <div className="admin-stats"><article><span>Total inquiries</span><strong>{inquiries.length}</strong></article><article><span>New inquiries</span><strong>{newCount}</strong></article><article><span>Needs follow-up</span><strong>{inquiries.filter((inquiry) => inquiry.status === "in_progress").length}</strong></article></div>
    {message && <p className="admin-message" role="status">{message}</p>}
    {loading ? <p className="admin-empty">Loading inquiries…</p> : inquiries.length === 0 ? <p className="admin-empty">No inquiries yet. New requests will appear here.</p> :
      <div className="admin-inquiries">{inquiries.map((inquiry) => <article className="admin-inquiry" key={inquiry.id}>
        <div className="inquiry-top"><div><span className="inquiry-date">{new Date(inquiry.created_at).toLocaleDateString()}</span><h2>{inquiry.name}</h2><a href={`mailto:${inquiry.email}`}>{inquiry.email}</a></div><select aria-label={`Update status for ${inquiry.name}`} value={inquiry.status} disabled={busyId === inquiry.id} onChange={(event) => { const status = statuses.find((item) => item === event.target.value); if (status) void updateStatus(inquiry.id, status); }}>{statuses.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}</select></div>
        <div className="inquiry-details"><span>{inquiry.company || "Independent"}</span><span>{inquiry.service || "Service not specified"}</span><span>{inquiry.budget || "Budget not specified"}</span><span>{inquiry.deadline || "Timing not specified"}</span>{inquiry.phone && <span>{inquiry.phone}</span>}</div><p className="inquiry-message">{inquiry.message}</p>
      </article>)}</div>}
  </section>;
}
