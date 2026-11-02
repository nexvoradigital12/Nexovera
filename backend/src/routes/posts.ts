import { Router } from "express";
import { z } from "zod";
import { supabase } from "../config/supabase.js";
import { requireAdmin } from "../middleware/admin.js";

export const postsRouter = Router();

const PAGE_SIZE = 6;

const slugify = (title: string) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");

const postBodySchema = z.object({
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().max(500).optional().default(""),
  content: z.string().trim().min(1).max(100000),
  seo_title: z.string().trim().max(200).optional().default(""),
  seo_description: z.string().trim().max(300).optional().default(""),
  published: z.boolean().optional().default(false),
});

const patchSchema = postBodySchema.partial();

// ─── Public: list published posts (paginated) ───────────────────────────────

postsRouter.get("/", async (req, res, next) => {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, published_at, created_at", { count: "exact" })
    .eq("published", true)
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) {
    next(error);
    return;
  }

  res.json({
    posts: data,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
    },
  });
});

// ─── Public: single post by slug ────────────────────────────────────────────

postsRouter.get("/:slug", async (req, res, next) => {
  const slug = req.params.slug;

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, content, seo_title, seo_description, published_at, created_at")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    next(error);
    return;
  }
  if (!data) {
    res.status(404).json({ error: "Post not found." });
    return;
  }

  res.json({ post: data });
});

// ─── Admin: list all posts (published + drafts) ──────────────────────────────

postsRouter.get("/admin/all", requireAdmin, async (_req, res, next) => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, published, published_at, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    next(error);
    return;
  }

  res.json({ posts: data });
});

// ─── Admin: create post ──────────────────────────────────────────────────────

postsRouter.post("/", requireAdmin, async (req, res, next) => {
  const parsed = postBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check the post details and try again." });
    return;
  }

  const { title, excerpt, content, seo_title, seo_description, published } = parsed.data;
  const slug = slugify(title);

  const published_at = published ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({ title, slug, excerpt, content, seo_title, seo_description, published, published_at })
    .select("id, title, slug, published")
    .single();

  if (error) {
    if (error.code === "23505") {
      res.status(409).json({ error: "A post with that title already exists. Please use a different title." });
      return;
    }
    next(error);
    return;
  }

  res.status(201).json({ post: data });
});

// ─── Admin: update post ──────────────────────────────────────────────────────

postsRouter.patch("/:id", requireAdmin, async (req, res, next) => {
  const parsedId = z.uuid().safeParse(req.params.id);
  if (!parsedId.success) {
    res.status(400).json({ error: "Invalid post ID." });
    return;
  }

  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check the post details and try again." });
    return;
  }

  const updates: Record<string, unknown> = { ...parsed.data };

  // If publishing for the first time, set published_at
  if (parsed.data.published === true) {
    const { data: existing } = await supabase
      .from("blog_posts")
      .select("published, published_at")
      .eq("id", parsedId.data)
      .maybeSingle();
    if (existing && !existing.published && !existing.published_at) {
      updates.published_at = new Date().toISOString();
    }
  }

  // Re-slug if title changed
  if (parsed.data.title) {
    updates.slug = slugify(parsed.data.title);
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .update(updates)
    .eq("id", parsedId.data)
    .select("id, title, slug, published, updated_at")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      res.status(409).json({ error: "A post with that title already exists." });
      return;
    }
    next(error);
    return;
  }
  if (!data) {
    res.status(404).json({ error: "Post not found." });
    return;
  }

  res.json({ post: data });
});

// ─── Admin: delete post ──────────────────────────────────────────────────────

postsRouter.delete("/:id", requireAdmin, async (req, res, next) => {
  const parsedId = z.uuid().safeParse(req.params.id);
  if (!parsedId.success) {
    res.status(400).json({ error: "Invalid post ID." });
    return;
  }

  const { error, count } = await supabase
    .from("blog_posts")
    .delete({ count: "exact" })
    .eq("id", parsedId.data);

  if (error) {
    next(error);
    return;
  }
  if (!count) {
    res.status(404).json({ error: "Post not found." });
    return;
  }

  res.json({ message: "Post deleted." });
});
