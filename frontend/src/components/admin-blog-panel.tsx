"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

// Load the MD editor only on the client — it uses browser-only APIs
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type PostDetail = Post & {
  content: string;
  seo_title: string;
  seo_description: string;
};

type View = "list" | "new" | "edit";

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  seo_title: "",
  seo_description: "",
  published: false,
};

export function AdminBlogPanel({ token }: { token: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [view, setView] = useState<View>("list");
  const [editing, setEditing] = useState<PostDetail | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const headers = useCallback(
    () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" }),
    [token]
  );

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${apiUrl}/api/posts/admin/all`, { headers: headers() });
      const data = await res.json() as { posts?: Post[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not load posts.");
      setPosts(data.posts ?? []);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not load posts.");
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => { void loadPosts(); }, [loadPosts]);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setMessage("");
    setView("new");
  }

  function openEdit(post: Post) {
    setMessage("");
    setBusy(true);
    fetch(`${apiUrl}/api/posts/admin/all`, { headers: headers() })
      .then((r) => r.json() as Promise<{ posts?: PostDetail[] }>)
      .then((data) => {
        const full = (data.posts ?? []).find((p) => p.id === post.id);
        if (!full) throw new Error("Post not found.");
        setEditing(full);
        setForm({
          title: full.title,
          excerpt: full.excerpt ?? "",
          content: full.content ?? "",
          seo_title: full.seo_title ?? "",
          seo_description: full.seo_description ?? "",
          published: full.published,
        });
        setView("edit");
      })
      .catch((err: unknown) => setMessage(err instanceof Error ? err.message : "Could not load post."))
      .finally(() => setBusy(false));
  }

  async function fetchFullPost(id: string): Promise<PostDetail | null> {
    const res = await fetch(`${apiUrl}/api/posts/admin/all`, { headers: headers() });
    const data = await res.json() as { posts?: PostDetail[] };
    return (data.posts ?? []).find((p) => p.id === id) ?? null;
  }

  async function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const payload = { ...form };
    const isEdit = view === "edit" && editing;

    try {
      const res = await fetch(
        isEdit ? `${apiUrl}/api/posts/${editing.id}` : `${apiUrl}/api/posts`,
        {
          method: isEdit ? "PATCH" : "POST",
          headers: headers(),
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not save post.");
      setMessage(isEdit ? "Post updated." : "Post created.");
      await loadPosts();
      setView("list");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save post.");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish(post: Post) {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(`${apiUrl}/api/posts/${post.id}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ published: !post.published }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not update post.");
      await loadPosts();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not update post.");
    } finally {
      setBusy(false);
    }
  }

  async function deletePost(post: Post) {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(`${apiUrl}/api/posts/${post.id}`, {
        method: "DELETE",
        headers: headers(),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not delete post.");
      await loadPosts();
      setMessage("Post deleted.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not delete post.");
    } finally {
      setBusy(false);
    }
  }

  // ── Form view ──────────────────────────────────────────────────────────────
  if (view === "new" || view === "edit") {
    return (
      <section className="admin-section admin-blog-form">
        <div className="admin-heading">
          <div>
            <p className="eyebrow">Nexvora workspace</p>
            <h1>{view === "edit" ? "Edit post" : "New post"}</h1>
          </div>
          <button
            className="admin-signout"
            type="button"
            onClick={() => { setView("list"); setMessage(""); }}
          >
            ← Back to posts
          </button>
        </div>

        {message && <p className="admin-message" role="status">{message}</p>}

        <form className="blog-form" onSubmit={savePost}>
          <label>
            Title <span>*</span>
            <input
              required
              maxLength={200}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Post title"
            />
          </label>

          <label>
            Excerpt
            <input
              maxLength={500}
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              placeholder="Short description shown in listings"
            />
          </label>

          <div className="blog-form-editor">
            <span className="blog-form-label">Content <span>*</span></span>
            <div data-color-mode="light">
              <MDEditor
                value={form.content}
                onChange={(val) => setForm((f) => ({ ...f, content: val ?? "" }))}
                height={400}
                preview="live"
              />
            </div>
          </div>

          <details className="blog-form-seo">
            <summary>SEO (optional)</summary>
            <label>
              SEO title
              <input
                maxLength={200}
                value={form.seo_title}
                onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))}
                placeholder="Overrides title in search results"
              />
            </label>
            <label>
              SEO description
              <input
                maxLength={300}
                value={form.seo_description}
                onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))}
                placeholder="Short description for search engines"
              />
            </label>
          </details>

          <label className="blog-form-publish-toggle">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
            />
            Publish immediately
          </label>

          <div className="form-submit">
            <button className="button button-primary" type="submit" disabled={busy}>
              {busy ? "Saving…" : view === "edit" ? "Save changes" : "Create post"}{" "}
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </form>
      </section>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────
  const published = posts.filter((p) => p.published).length;

  return (
    <section className="admin-section">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Nexvora workspace</p>
          <h1>Blog posts</h1>
          <p>Manage your published and draft posts.</p>
        </div>
        <button className="button button-primary" type="button" onClick={openNew}>
          New post <span aria-hidden="true">↗</span>
        </button>
      </div>

      <div className="admin-stats">
        <article><span>Total posts</span><strong>{posts.length}</strong></article>
        <article><span>Published</span><strong>{published}</strong></article>
        <article><span>Drafts</span><strong>{posts.length - published}</strong></article>
      </div>

      {message && <p className="admin-message" role="status">{message}</p>}

      {loading ? (
        <p className="admin-empty">Loading posts…</p>
      ) : posts.length === 0 ? (
        <p className="admin-empty">No posts yet. Create your first one above.</p>
      ) : (
        <div className="admin-blog-list">
          {posts.map((post) => (
            <article className="admin-blog-item" key={post.id}>
              <div className="admin-blog-item-top">
                <div>
                  <span className={`blog-status-badge ${post.published ? "published" : "draft"}`}>
                    {post.published ? "Published" : "Draft"}
                  </span>
                  <h2>{post.title}</h2>
                  <span className="inquiry-date">
                    {new Date(post.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="admin-blog-actions">
                  <button
                    type="button"
                    className="admin-blog-action"
                    onClick={() => openEdit(post)}
                    disabled={busy}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="admin-blog-action"
                    onClick={() => void togglePublish(post)}
                    disabled={busy}
                  >
                    {post.published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    className="admin-blog-action admin-blog-action-delete"
                    onClick={() => void deletePost(post)}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </div>
              </div>
              {post.excerpt && <p className="inquiry-message">{post.excerpt}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
