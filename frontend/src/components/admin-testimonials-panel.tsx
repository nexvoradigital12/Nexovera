"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Testimonial = {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type View = "list" | "new" | "edit";

const emptyForm = { name: "", role: "", company: "", quote: "", published: false, sort_order: 0 };

export function AdminTestimonialsPanel({ token }: { token: string }) {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [view, setView] = useState<View>("list");
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const hdrs = useCallback(() => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" }), [token]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/testimonials/admin/all`, { headers: hdrs() });
      const data = await res.json() as { testimonials?: Testimonial[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not load testimonials.");
      setItems(data.testimonials ?? []);
    } catch (err) { setMessage(err instanceof Error ? err.message : "Could not load testimonials."); }
    finally { setLoading(false); }
  }, [hdrs]);

  useEffect(() => { void load(); }, [load]);

  function openNew() { setEditing(null); setForm(emptyForm); setMessage(""); setView("new"); }
  function openEdit(t: Testimonial) { setEditing(t); setForm({ name: t.name, role: t.role, company: t.company, quote: t.quote, published: t.published, sort_order: t.sort_order }); setMessage(""); setView("edit"); }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const res = await fetch(editing ? `${apiUrl}/api/testimonials/${editing.id}` : `${apiUrl}/api/testimonials`, {
        method: editing ? "PATCH" : "POST", headers: hdrs(), body: JSON.stringify(form),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not save testimonial.");
      await load(); setView("list"); setMessage(editing ? "Testimonial updated." : "Testimonial created.");
    } catch (err) { setMessage(err instanceof Error ? err.message : "Could not save testimonial."); }
    finally { setBusy(false); }
  }

  async function toggle(t: Testimonial) {
    setBusy(true); setMessage("");
    try {
      const res = await fetch(`${apiUrl}/api/testimonials/${t.id}`, { method: "PATCH", headers: hdrs(), body: JSON.stringify({ published: !t.published }) });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not update testimonial.");
      await load();
    } catch (err) { setMessage(err instanceof Error ? err.message : "Could not update testimonial."); }
    finally { setBusy(false); }
  }

  async function remove(t: Testimonial) {
    if (!window.confirm(`Delete testimonial from "${t.name}"?`)) return;
    setBusy(true); setMessage("");
    try {
      const res = await fetch(`${apiUrl}/api/testimonials/${t.id}`, { method: "DELETE", headers: hdrs() });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not delete testimonial.");
      await load(); setMessage("Testimonial deleted.");
    } catch (err) { setMessage(err instanceof Error ? err.message : "Could not delete testimonial."); }
    finally { setBusy(false); }
  }

  if (view !== "list") {
    return (
      <section className="admin-section">
        <div className="admin-heading">
          <div><p className="eyebrow">Nexvora workspace</p><h1>{view === "edit" ? "Edit testimonial" : "New testimonial"}</h1></div>
          <button className="admin-signout" type="button" onClick={() => { setView("list"); setMessage(""); }}>← Back</button>
        </div>
        {message && <p className="admin-message" role="status">{message}</p>}
        <form className="crud-form" onSubmit={save}>
          <div className="crud-form-grid">
            <label>Name <span>*</span><input required maxLength={120} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Client name" /></label>
            <label>Role<input maxLength={120} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="CEO, Designer…" /></label>
            <label>Company<input maxLength={160} value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Company name" /></label>
            <label className="crud-inline-label">Sort order<input type="number" min={0} value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} /></label>
          </div>
          <label>Quote <span>*</span><textarea required rows={4} minLength={10} maxLength={2000} value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} placeholder="What did they say about working with Nexvora?" /></label>
          <label className="blog-form-publish-toggle"><input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />Publish</label>
          <div className="form-submit">
            <button className="button button-primary" type="submit" disabled={busy}>{busy ? "Saving…" : view === "edit" ? "Save changes" : "Create testimonial"} <span aria-hidden="true">↗</span></button>
          </div>
        </form>
      </section>
    );
  }

  return (
    <section className="admin-section">
      <div className="admin-heading">
        <div><p className="eyebrow">Nexvora workspace</p><h1>Testimonials</h1><p>Manage client testimonials shown on the site.</p></div>
        <button className="button button-primary" type="button" onClick={openNew}>New testimonial <span aria-hidden="true">↗</span></button>
      </div>
      <div className="admin-stats">
        <article><span>Total</span><strong>{items.length}</strong></article>
        <article><span>Published</span><strong>{items.filter(t => t.published).length}</strong></article>
        <article><span>Drafts</span><strong>{items.filter(t => !t.published).length}</strong></article>
      </div>
      {message && <p className="admin-message" role="status">{message}</p>}
      {loading ? <p className="admin-empty">Loading…</p> : items.length === 0 ? <p className="admin-empty">No testimonials yet.</p> : (
        <div className="admin-blog-list">
          {items.map(t => (
            <article className="admin-blog-item" key={t.id}>
              <div className="admin-blog-item-top">
                <div>
                  <span className={`blog-status-badge ${t.published ? "published" : "draft"}`}>{t.published ? "Published" : "Draft"}</span>
                  <h2>{t.name}</h2>
                  {(t.role || t.company) && <span className="inquiry-date">{[t.role, t.company].filter(Boolean).join(" · ")}</span>}
                  <p className="inquiry-message">❝ {t.quote}</p>
                </div>
                <div className="admin-blog-actions">
                  <button type="button" className="admin-blog-action" onClick={() => openEdit(t)} disabled={busy}>Edit</button>
                  <button type="button" className="admin-blog-action" onClick={() => void toggle(t)} disabled={busy}>{t.published ? "Unpublish" : "Publish"}</button>
                  <button type="button" className="admin-blog-action admin-blog-action-delete" onClick={() => void remove(t)} disabled={busy}>Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
