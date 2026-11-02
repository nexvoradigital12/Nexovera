import { Router } from "express";
import { z } from "zod";
import { supabase } from "../config/supabase.js";
import { requireAdmin } from "../middleware/admin.js";

export const servicesRouter = Router();

const slugify = (title: string) =>
  title.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "");

const serviceBodySchema = z.object({
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().max(500).optional().default(""),
  body: z.string().trim().max(20000).optional().default(""),
  published: z.boolean().optional().default(false),
  sort_order: z.number().int().min(0).optional().default(0),
});

const patchSchema = serviceBodySchema.partial();

// ── Public: list published services ────────────────────────────────────────
servicesRouter.get("/", async (_req, res, next) => {
  const { data, error } = await supabase
    .from("services")
    .select("id, title, slug, summary, published, sort_order")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) { next(error); return; }
  res.json({ services: data });
});

// ── Admin: list all services ────────────────────────────────────────────────
servicesRouter.get("/admin/all", requireAdmin, async (_req, res, next) => {
  const { data, error } = await supabase
    .from("services")
    .select("id, title, slug, summary, body, published, sort_order, created_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) { next(error); return; }
  res.json({ services: data });
});

// ── Public: single service by slug ─────────────────────────────────────────
servicesRouter.get("/:slug", async (req, res, next) => {
  const { data, error } = await supabase
    .from("services")
    .select("id, title, slug, summary, body")
    .eq("slug", req.params.slug)
    .eq("published", true)
    .maybeSingle();
  if (error) { next(error); return; }
  if (!data) { res.status(404).json({ error: "Service not found." }); return; }
  res.json({ service: data });
});

// ── Admin: create service ───────────────────────────────────────────────────
servicesRouter.post("/", requireAdmin, async (req, res, next) => {
  const parsed = serviceBodySchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Please check the service details." }); return; }
  const { title, summary, body, published, sort_order } = parsed.data;
  const slug = slugify(title);
  const { data, error } = await supabase
    .from("services")
    .insert({ title, slug, summary, body, published, sort_order })
    .select("id, title, slug, published")
    .single();
  if (error) {
    if (error.code === "23505") { res.status(409).json({ error: "A service with that title already exists." }); return; }
    next(error); return;
  }
  res.status(201).json({ service: data });
});

// ── Admin: update service ───────────────────────────────────────────────────
servicesRouter.patch("/:id", requireAdmin, async (req, res, next) => {
  const parsedId = z.uuid().safeParse(req.params.id);
  if (!parsedId.success) { res.status(400).json({ error: "Invalid service ID." }); return; }
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Please check the service details." }); return; }
  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.title) updates.slug = slugify(parsed.data.title);
  const { data, error } = await supabase
    .from("services").update(updates).eq("id", parsedId.data)
    .select("id, title, slug, published").maybeSingle();
  if (error) {
    if (error.code === "23505") { res.status(409).json({ error: "A service with that title already exists." }); return; }
    next(error); return;
  }
  if (!data) { res.status(404).json({ error: "Service not found." }); return; }
  res.json({ service: data });
});

// ── Admin: delete service ───────────────────────────────────────────────────
servicesRouter.delete("/:id", requireAdmin, async (req, res, next) => {
  const parsedId = z.uuid().safeParse(req.params.id);
  if (!parsedId.success) { res.status(400).json({ error: "Invalid service ID." }); return; }
  const { error, count } = await supabase.from("services").delete({ count: "exact" }).eq("id", parsedId.data);
  if (error) { next(error); return; }
  if (!count) { res.status(404).json({ error: "Service not found." }); return; }
  res.json({ message: "Service deleted." });
});
