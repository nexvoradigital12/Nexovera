import { Router } from "express";
import { z } from "zod";
import { supabase } from "../config/supabase.js";
import { requireAdmin } from "../middleware/admin.js";

export const settingsRouter = Router();

const settingsSchema = z.object({
  company_name: z.string().trim().min(1).max(200).optional(),
  contact_email: z.email().max(254).optional(),
  phone: z.string().trim().max(40).optional(),
  location: z.string().trim().max(200).optional(),
  social_links: z.record(z.string(), z.string().trim().max(500)).optional(),
});

// ── Public: get site settings ───────────────────────────────────────────────
settingsRouter.get("/", async (_req, res, next) => {
  const { data, error } = await supabase
    .from("site_settings")
    .select("company_name, contact_email, phone, location, social_links")
    .eq("id", 1)
    .maybeSingle();
  if (error) { next(error); return; }
  res.json({ settings: data });
});

// ── Admin: update site settings ─────────────────────────────────────────────
settingsRouter.patch("/", requireAdmin, async (req, res, next) => {
  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Please check the settings details." }); return; }
  // Upsert — row with id=1 is guaranteed by the schema default
  const { data, error } = await supabase
    .from("site_settings")
    .update(parsed.data)
    .eq("id", 1)
    .select("company_name, contact_email, phone, location, social_links")
    .maybeSingle();
  if (error) { next(error); return; }
  if (!data) { res.status(404).json({ error: "Site settings not found. Run the initial migration first." }); return; }
  res.json({ settings: data });
});
