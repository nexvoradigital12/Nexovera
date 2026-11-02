"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Project = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  category: string;
  technologies: string[];
  live_url: string | null;
  published: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type View = "list" | "new" | "edit";

const emptyForm = { name: "", summary: "", description: "", category: "", technologies: "", live_url: "", published: false, featured: false, sort_order: 0 };

export function AdminProjectsPanel({ token }: { token: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [view, setView] = useState<View>("list");
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const hdrs = useCallback(() => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" }), [token]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/projects/admin/all`, { headers: hdrs() });
      const data = await res.json() as { projects?: Project[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not load projects.");
      setProjects(data.projects ?? []);
    } catch (err) { setMessage(err instanceof Error ? err.message : "Could not load projects."); }
    finally { setLoading(false); }
  }, [hdrs]);

  useEffect(() => { void load(); }, [load]);

  function openNew() { setEditing(null); setForm(emptyForm); setMessage(""); setView("new"); }
  function openEdit(p: Project) {
    setEditing(p);
    setForm({ name: p.name, summary: p.summary, description: p.description, category: p.category, technologies: p.technologies.join(", "), live_url: p.live_url ?? "", published: p.published, featured: p.featured, sort_order: p.sort_order });
    setMessage(""); setView("edit");
  }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMessage("");
    const payload = { ...form, technologies: form.technologies.split(",").map(t => t.trim()).filter(Boolean) };
    try {
      const res = await fetch(editing ? `${apiUrl}/api/projects/${editing.id}` : `${apiUrl}/api/projects`, {
        method: editing ? "PATCH" : "POST", headers: hdrs(), body: JSON.stringify(payload),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not save project.");
      await load(); setView("list"); setMessage(editing ? "Project updated." : "Project created.");
    } catch (err) { setMessage(err instanceof Error ? err.message : "Could not save project."); }
    finally { setBusy(false); }
  }

  async function toggle(p: Project) {
    setBusy(true); setMessage("");
    try {
      const res = await fetch(`${apiUrl}/api/projects/${p.id}`, { method: "PATCH", headers: hdrs(), body: JSON.stringify({ published: !p.published }) });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not update project.");
      await load();
    } catch (err) { setMessage(err instanceof Error ? err.message : "Could not update project."); }
    finally { setBusy(false); }
  }

  async function remove(p: Project) {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    setBusy(true); setMessage("");
    try {
      const res = await fetch(`${apiUrl}/api/projects/${p.id}`, { method: "DELETE", headers: hdrs() });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not delete project.");
      await load(); setMessage("Project deleted.");
    } catch (err) { setMessage(err instanceof Error ? err.message : "Could not delete project."); }
    finally { setBusy(false); }
  }

  if (view !== "list") {
    return (
      <section className="admin-section">
        <div className="admin-heading">
          <div><p className="eyebrow">Nexvora workspace</p><h1>{view === "edit" ? "Edit project" : "New project"}</h1></div>
          <button className="admin-signout" type="button" onClick={() => { setView("list"); setMessage(""); }}>← Back</button>
        </div>
        {message && <p className="admin-message" role="status">{message}</p>}
        <form className="crud-form" onSubmit={save}>
          <div className="crud-form-grid">
            <label>Project name <span>*</span><input required maxLength={200} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Project name" /></label>
            <label>Category<input maxLength={120} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Brand & web" /></label>
          </div>
          <label>Summary<input maxLength={500} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="Short description for listings" /></label>
          <label>Full description<textarea rows={5} maxLength={5000} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detailed project description" /></label>
          <label>Technologies <span className="crud-hint">(comma-separated)</span><input value={form.technologies} onChange={e => setForm(f => ({ ...f, technologies: e.target.value }))} placeholder="React, TypeScript, Tailwind" /></label>
          <label>Live URL<input type="url" value={form.live_url} onChange={e => setForm(f => ({ ...f, live_url: e.target.value }))} placeholder="https://example.com" /></label>
          <div className="crud-form-row">
            <label className="blog-form-publish-toggle"><input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} />Publish</label>
            <label className="blog-form-publish-toggle"><input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />Feature on homepage</label>
            <label className="crud-inline-label">Sort order<input type="number" min={0} value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} /></label>
          </div>
          <div className="form-submit">
            <button className="button button-primary" type="submit" disabled={busy}>{busy ? "Saving…" : view === "edit" ? "Save changes" : "Create project"} <span aria-hidden="true">↗</span></button>
          </div>
        </form>
      </section>
    );
  }

  return (
    <section className="admin-section">
      <div className="admin-heading">
        <div><p className="eyebrow">Nexvora workspace</p><h1>Portfolio</h1><p>Manage portfolio projects shown on the site.</p></div>
        <button className="button button-primary" type="button" onClick={openNew}>New project <span aria-hidden="true">↗</span></button>
      </div>
      <div className="admin-stats">
        <article><span>Total</span><strong>{projects.length}</strong></article>
        <article><span>Published</span><strong>{projects.filter(p => p.published).length}</strong></article>
        <article><span>Featured</span><strong>{projects.filter(p => p.featured).length}</strong></article>
      </div>
      {message && <p className="admin-message" role="status">{message}</p>}
      {loading ? <p className="admin-empty">Loading…</p> : projects.length === 0 ? <p className="admin-empty">No projects yet.</p> : (
        <div className="admin-blog-list">
          {projects.map(p => (
            <article className="admin-blog-item" key={p.id}>
              <div className="admin-blog-item-top">
                <div>
                  <div className="crud-badges">
                    <span className={`blog-status-badge ${p.published ? "published" : "draft"}`}>{p.published ? "Published" : "Draft"}</span>
                    {p.featured && <span className="blog-status-badge published">Featured</span>}
                    {p.category && <span className="crud-category">{p.category}</span>}
                  </div>
                  <h2>{p.name}</h2>
                  {p.summary && <p className="inquiry-message">{p.summary}</p>}
                  {p.technologies.length > 0 && <div className="tag-list">{p.technologies.map(t => <span key={t}>{t}</span>)}</div>}
                </div>
                <div className="admin-blog-actions">
                  <button type="button" className="admin-blog-action" onClick={() => openEdit(p)} disabled={busy}>Edit</button>
                  <button type="button" className="admin-blog-action" onClick={() => void toggle(p)} disabled={busy}>{p.published ? "Unpublish" : "Publish"}</button>
                  <button type="button" className="admin-blog-action admin-blog-action-delete" onClick={() => void remove(p)} disabled={busy}>Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
