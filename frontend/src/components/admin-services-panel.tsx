"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Service = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type View = "list" | "new" | "edit";

const emptyForm = { title: "", summary: "", body: "", published: false, sort_order: 0 };

export function AdminServicesPanel({ token }: { token: string }) {
  const [services, setServices] = useState<Service[]>([]);
  const [view, setView] = useState<View>("list");
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const hdrs = useCallback(() => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }), [token]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/services/admin/all`, { headers: hdrs() });
      const data = await res.json() as { services?: Service[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not load services.");
      setServices(data.services ?? []);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not load services.");
    } finally {
      setLoading(false);
    }
  }, [hdrs]);

  useEffect(() => { void load(); }, [load]);

  function openNew() { setEditing(null); setForm(emptyForm); setMessage(""); setView("new"); }
  function openEdit(s: Service) { setEditing(s); setForm({ title: s.title, summary: s.summary, body: s.body, published: s.published, sort_order: s.sort_order }); setMessage(""); setView("edit"); }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const res = await fetch(editing ? `${apiUrl}/api/services/${editing.id}` : `${apiUrl}/api/services`, {
        method: editing ? "PATCH" : "POST", headers: hdrs(), body: JSON.stringify(form),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not save service.");
      await load(); setView("list"); setMessage(editing ? "Service updated." : "Service created.");
    } catch (err) { setMessage(err instanceof Error ? err.message : "Could not save service."); }
    finally { setBusy(false); }
  }

  async function toggle(s: Service) {
    setBusy(true); setMessage("");
    try {
      const res = await fetch(`${apiUrl}/api/services/${s.id}`, { method: "PATCH", headers: hdrs(), body: JSON.stringify({ published: !s.published }) });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not update service.");
      await load();
    } catch (err) { setMessage(err instanceof Error ? err.message : "Could not update service."); }
    finally { setBusy(false); }
  }

  async function remove(s: Service) {
    if (!window.confirm(`Delete "${s.title}"?`)) return;
    setBusy(true); setMessage("");
    try {
      const res = await fetch(`${apiUrl}/api/services/${s.id}`, { method: "DELETE", headers: hdrs() });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not delete service.");
      await load(); setMessage("Service deleted.");
    } catch (err) { setMessage(err instanceof Error ? err.message : "Could not delete service."); }
    finally { setBusy(false); }
  }

  if (view !== "list") {
    return (
      <section className="admin-section">
        <div className="admin-heading">
          <div><p className="eyebrow">Nexvora workspace</p><h1>{view === "edit" ? "Edit service" : "New service"}</h1></div>
          <button className="admin-signout" type="button" onClick={() => { setView("list"); setMessage(""); }}>← Back</button>
        </div>
        {message && <p className="admin-message" role="status">{message}</p>}
        <form className="crud-form" onSubmit={save}>
          <label>Title <span>*</span><input required maxLength={200} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Service title" /></label>
          <label>Summary<input maxLength={500} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="Short description shown in listings" /></label>
          <label>Full description<textarea rows={6} maxLength={20000} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Detailed service description" /></label>
          <label className="crud-inline-label">Sort order<input type="number" min={0} value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} /></label>
          <label className="blog-form-publish-toggle"><input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />Publish</label>
          <div className="form-submit">
            <button className="button button-primary" type="submit" disabled={busy}>{busy ? "Saving…" : view === "edit" ? "Save changes" : "Create service"} <span aria-hidden="true">↗</span></button>
          </div>
        </form>
      </section>
    );
  }

  return (
    <section className="admin-section">
      <div className="admin-heading">
        <div><p className="eyebrow">Nexvora workspace</p><h1>Services</h1><p>Manage the services shown on the site.</p></div>
        <button className="button button-primary" type="button" onClick={openNew}>New service <span aria-hidden="true">↗</span></button>
      </div>
      <div className="admin-stats">
        <article><span>Total</span><strong>{services.length}</strong></article>
        <article><span>Published</span><strong>{services.filter(s => s.published).length}</strong></article>
        <article><span>Drafts</span><strong>{services.filter(s => !s.published).length}</strong></article>
      </div>
      {message && <p className="admin-message" role="status">{message}</p>}
      {loading ? <p className="admin-empty">Loading…</p> : services.length === 0 ? <p className="admin-empty">No services yet.</p> : (
        <div className="admin-blog-list">
          {services.map(s => (
            <article className="admin-blog-item" key={s.id}>
              <div className="admin-blog-item-top">
                <div>
                  <span className={`blog-status-badge ${s.published ? "published" : "draft"}`}>{s.published ? "Published" : "Draft"}</span>
                  <h2>{s.title}</h2>
                  {s.summary && <p className="inquiry-message">{s.summary}</p>}
                </div>
                <div className="admin-blog-actions">
                  <button type="button" className="admin-blog-action" onClick={() => openEdit(s)} disabled={busy}>Edit</button>
                  <button type="button" className="admin-blog-action" onClick={() => void toggle(s)} disabled={busy}>{s.published ? "Unpublish" : "Publish"}</button>
                  <button type="button" className="admin-blog-action admin-blog-action-delete" onClick={() => void remove(s)} disabled={busy}>Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
