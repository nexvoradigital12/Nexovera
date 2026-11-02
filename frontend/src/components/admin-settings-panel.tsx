"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type SocialLinks = Record<string, string>;

type Settings = {
  company_name: string;
  contact_email: string;
  phone: string;
  location: string;
  social_links: SocialLinks;
};

const emptySettings: Settings = {
  company_name: "",
  contact_email: "",
  phone: "",
  location: "",
  social_links: {},
};

const SOCIAL_KEYS = ["linkedin", "twitter", "instagram", "facebook", "github", "youtube"];

export function AdminSettingsPanel({ token }: { token: string }) {
  const [form, setForm] = useState<Settings>(emptySettings);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState<"ok" | "err">("ok");

  const hdrs = useCallback(() => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" }), [token]);

  useEffect(() => {
    fetch(`${apiUrl}/api/settings`, { headers: hdrs() })
      .then(r => r.json() as Promise<{ settings?: Settings; error?: string }>)
      .then(data => {
        if (data.error) throw new Error(data.error);
        if (data.settings) setForm({ ...emptySettings, ...data.settings, social_links: data.settings.social_links ?? {} });
      })
      .catch((err: unknown) => { setMessageKind("err"); setMessage(err instanceof Error ? err.message : "Could not load settings."); })
      .finally(() => setLoading(false));
  }, [hdrs]);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const res = await fetch(`${apiUrl}/api/settings`, { method: "PATCH", headers: hdrs(), body: JSON.stringify(form) });
      const data = await res.json() as { settings?: Settings; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not save settings.");
      if (data.settings) setForm({ ...emptySettings, ...data.settings, social_links: data.settings.social_links ?? {} });
      setMessageKind("ok"); setMessage("Settings saved.");
    } catch (err) { setMessageKind("err"); setMessage(err instanceof Error ? err.message : "Could not save settings."); }
    finally { setBusy(false); }
  }

  function setSocial(key: string, value: string) {
    setForm(f => {
      const links = { ...f.social_links };
      if (value) links[key] = value; else delete links[key];
      return { ...f, social_links: links };
    });
  }

  return (
    <section className="admin-section">
      <div className="admin-heading">
        <div><p className="eyebrow">Nexvora workspace</p><h1>Site settings</h1><p>Update your company information and social links.</p></div>
      </div>
      {message && <p className={`admin-message ${messageKind === "ok" ? "admin-message-ok" : ""}`} role="status">{message}</p>}
      {loading ? <p className="admin-empty">Loading…</p> : (
        <form className="crud-form settings-form" onSubmit={save}>
          <div className="settings-group">
            <h2 className="settings-group-title">Company details</h2>
            <div className="crud-form-grid">
              <label>Company name<input maxLength={200} value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="Nexvora Digital Solutions" /></label>
              <label>Contact email<input type="email" maxLength={254} value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} placeholder="hello@nexvora.com" /></label>
              <label>Phone<input maxLength={40} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000" /></label>
              <label>Location<input maxLength={200} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="City, Country" /></label>
            </div>
          </div>
          <div className="settings-group">
            <h2 className="settings-group-title">Social links</h2>
            <div className="crud-form-grid">
              {SOCIAL_KEYS.map(key => (
                <label key={key} className="settings-social-label">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  <input type="url" maxLength={500} value={form.social_links[key] ?? ""} onChange={e => setSocial(key, e.target.value)} placeholder={`https://${key}.com/nexvora`} />
                </label>
              ))}
            </div>
          </div>
          <div className="form-submit">
            <button className="button button-primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save settings"} <span aria-hidden="true">↗</span></button>
          </div>
        </form>
      )}
    </section>
  );
}
