import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { supabase } from "../config/supabase.js";
import { requireAdmin } from "../middleware/admin.js";

export const inquiriesRouter = Router();

const inquirySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(254),
  phone: z.string().trim().max(40).optional().default(""),
  company: z.string().trim().max(160).optional().default(""),
  service: z.string().trim().max(120).optional().default(""),
  budget: z.string().trim().max(80).optional().default(""),
  deadline: z.string().trim().max(80).optional().default(""),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(0).optional(),
});

const statuses = ["new", "in_progress", "contacted", "closed"] as const;
const statusSchema = z.object({ status: z.enum(statuses) });

const inquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many inquiries from this network. Please try again later." },
});

inquiriesRouter.post("/", inquiryLimiter, async (req, res, next) => {
  const parsed = inquirySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check your details and try again." });
    return;
  }
  if (parsed.data.website) {
    res.status(400).json({ error: "Your inquiry could not be accepted." });
    return;
  }

  const { website: _website, ...inquiry } = parsed.data;
  const { error } = await supabase.from("inquiries").insert(inquiry);
  if (error) {
    next(error);
    return;
  }
  res.status(201).json({ message: "Inquiry received." });
});

inquiriesRouter.get("/", requireAdmin, async (_req, res, next) => {
  const { data, error } = await supabase
    .from("inquiries")
    .select("id, name, email, phone, company, service, budget, deadline, message, status, created_at, admin_notes")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) {
    next(error);
    return;
  }
  res.json({ inquiries: data });
});

inquiriesRouter.patch("/:id", requireAdmin, async (req, res, next) => {
  const parsedId = z.uuid().safeParse(req.params.id);
  if (!parsedId.success) {
    res.status(400).json({ error: "Choose a valid inquiry." });
    return;
  }
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Choose a valid inquiry status." });
    return;
  }
  const { data, error } = await supabase
    .from("inquiries")
    .update({ status: parsed.data.status })
    .eq("id", parsedId.data)
    .select("id, status")
    .maybeSingle();
  if (error) {
    next(error);
    return;
  }
  if (!data) {
    res.status(404).json({ error: "Inquiry not found." });
    return;
  }
  res.json({ inquiry: data });
});
