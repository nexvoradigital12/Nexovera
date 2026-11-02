import { Router } from "express";
import { z } from "zod";
import { supabase } from "../config/supabase.js";
import { requireAdmin } from "../middleware/admin.js";

export const testimonialsRouter = Router();

const testimonialBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  role: z.string().trim().max(120).optional().default(""),
  company: z.string().trim().max(160).optional().default(""),
  quote: z.string().trim().min(10).max(2000),
  published: z.boolean().optional().default(false),
  sort_order: z.number().int().min(0).optional().default(0),
});

const patchSchema = testimonialBodySchema.partial();

// ── Public: list published testimonials ────────────────────────────────────
testimonialsRouter.get("/", async (_req, res, next) => {
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, name, role, company, quote, sort_order")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) { next(error); return; }
  res.json({ testimonials: data });
});

// ── Admin: list all testimonials ────────────────────────────────────────────
testimonialsRouter.get("/admin/all", requireAdmin, async (_req, res, next) => {
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, name, role, company, quote, published, sort_order, created_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) { next(error); return; }
  res.json({ testimonials: data });
});

// ── Admin: create testimonial ───────────────────────────────────────────────
testimonialsRouter.post("/", requireAdmin, async (req, res, next) => {
  const parsed = testimonialBodySchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Please check the testimonial details." }); return; }
  const { data, error } = await supabase
    .from("testimonials").insert(parsed.data).select("id, name, published").single();
  if (error) { next(error); return; }
  res.status(201).json({ testimonial: data });
});

// ── Admin: update testimonial ───────────────────────────────────────────────
testimonialsRouter.patch("/:id", requireAdmin, async (req, res, next) => {
  const parsedId = z.uuid().safeParse(req.params.id);
  if (!parsedId.success) { res.status(400).json({ error: "Invalid testimonial ID." }); return; }
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Please check the testimonial details." }); return; }
  const { data, error } = await supabase
    .from("testimonials").update(parsed.data).eq("id", parsedId.data)
    .select("id, name, published").maybeSingle();
  if (error) { next(error); return; }
  if (!data) { res.status(404).json({ error: "Testimonial not found." }); return; }
  res.json({ testimonial: data });
});

// ── Admin: delete testimonial ───────────────────────────────────────────────
testimonialsRouter.delete("/:id", requireAdmin, async (req, res, next) => {
  const parsedId = z.uuid().safeParse(req.params.id);
  if (!parsedId.success) { res.status(400).json({ error: "Invalid testimonial ID." }); return; }
  const { error, count } = await supabase.from("testimonials").delete({ count: "exact" }).eq("id", parsedId.data);
  if (error) { next(error); return; }
  if (!count) { res.status(404).json({ error: "Testimonial not found." }); return; }
  res.json({ message: "Testimonial deleted." });
});
