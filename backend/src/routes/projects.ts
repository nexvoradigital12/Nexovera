import { Router } from "express";
import { z } from "zod";
import { supabase } from "../config/supabase.js";
import { requireAdmin } from "../middleware/admin.js";

export const projectsRouter = Router();

const slugify = (name: string) =>
  name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "");

const projectBodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  summary: z.string().trim().max(500).optional().default(""),
  description: z.string().trim().max(5000).optional().default(""),
  category: z.string().trim().max(120).optional().default(""),
  technologies: z.array(z.string().trim().max(80)).max(20).optional().default([]),
  live_url: z.url().optional().or(z.literal("")).default(""),
  published: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
  sort_order: z.number().int().min(0).optional().default(0),
});

const patchSchema = projectBodySchema.partial();

// ── Public: list published projects ────────────────────────────────────────
projectsRouter.get("/", async (_req, res, next) => {
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, slug, summary, description, category, technologies, live_url, featured, sort_order")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) { next(error); return; }
  res.json({ projects: data });
});

// ── Admin: list all projects ────────────────────────────────────────────────
projectsRouter.get("/admin/all", requireAdmin, async (_req, res, next) => {
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, slug, summary, description, category, technologies, live_url, published, featured, sort_order, created_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) { next(error); return; }
  res.json({ projects: data });
});

// ── Public: single project by slug ─────────────────────────────────────────
projectsRouter.get("/:slug", async (req, res, next) => {
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, slug, summary, description, category, technologies, live_url")
    .eq("slug", req.params.slug)
    .eq("published", true)
    .maybeSingle();
  if (error) { next(error); return; }
  if (!data) { res.status(404).json({ error: "Project not found." }); return; }
  res.json({ project: data });
});

// ── Admin: create project ───────────────────────────────────────────────────
projectsRouter.post("/", requireAdmin, async (req, res, next) => {
  const parsed = projectBodySchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Please check the project details." }); return; }
  const { name, summary, description, category, technologies, live_url, published, featured, sort_order } = parsed.data;
  const slug = slugify(name);
  const { data, error } = await supabase
    .from("projects")
    .insert({ name, slug, summary, description, category, technologies, live_url: live_url || null, published, featured, sort_order })
    .select("id, name, slug, published")
    .single();
  if (error) {
    if (error.code === "23505") { res.status(409).json({ error: "A project with that name already exists." }); return; }
    next(error); return;
  }
  res.status(201).json({ project: data });
});

// ── Admin: update project ───────────────────────────────────────────────────
projectsRouter.patch("/:id", requireAdmin, async (req, res, next) => {
  const parsedId = z.uuid().safeParse(req.params.id);
  if (!parsedId.success) { res.status(400).json({ error: "Invalid project ID." }); return; }
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Please check the project details." }); return; }
  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.name) updates.slug = slugify(parsed.data.name);
  if ("live_url" in updates && !updates.live_url) updates.live_url = null;
  const { data, error } = await supabase
    .from("projects").update(updates).eq("id", parsedId.data)
    .select("id, name, slug, published").maybeSingle();
  if (error) {
    if (error.code === "23505") { res.status(409).json({ error: "A project with that name already exists." }); return; }
    next(error); return;
  }
  if (!data) { res.status(404).json({ error: "Project not found." }); return; }
  res.json({ project: data });
});

// ── Admin: delete project ───────────────────────────────────────────────────
projectsRouter.delete("/:id", requireAdmin, async (req, res, next) => {
  const parsedId = z.uuid().safeParse(req.params.id);
  if (!parsedId.success) { res.status(400).json({ error: "Invalid project ID." }); return; }
  const { error, count } = await supabase.from("projects").delete({ count: "exact" }).eq("id", parsedId.data);
  if (error) { next(error); return; }
  if (!count) { res.status(404).json({ error: "Project not found." }); return; }
  res.json({ message: "Project deleted." });
});
