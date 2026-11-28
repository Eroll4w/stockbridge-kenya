import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

const medicineSchema = z.object({
  name: z.string().trim().min(1),
  strength: z.string().trim().min(1),
  unit: z.string().trim().min(1),
});

router.get("/", async (_req, res, next) => {
  try {
    res.json(await prisma.medicine.findMany({ orderBy: { name: "asc" } }));
  } catch (err) {
    next(err);
  }
});

router.post("/", requireRole("ADMIN"), async (req, res, next) => {
  try {
    const parsed = medicineSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const medicine = await prisma.medicine.create({ data: parsed.data });
    res.status(201).json(medicine);
  } catch (err: any) {
    if (err.code === "P2002") return res.status(409).json({ error: "Medicine already exists" });
    next(err);
  }
});

router.put("/:id", requireRole("ADMIN"), async (req, res, next) => {
  try {
    const parsed = medicineSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const medicine = await prisma.medicine.update({
      where: { id: Number(req.params.id) },
      data: parsed.data,
    });
    res.json(medicine);
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Medicine not found" });
    if (err.code === "P2002") return res.status(409).json({ error: "Medicine already exists" });
    next(err);
  }
});

export default router;