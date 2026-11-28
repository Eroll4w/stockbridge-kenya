import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

const movementSchema = z.object({
  medicineId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive(),
  note: z.string().max(200).optional(),
});

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

// View stock: pharmacists see their facility, admins see everything
router.get("/", async (req, res, next) => {
  try {
    const user = req.user!;
    const stocks = await prisma.stock.findMany({
      where: user.role === "ADMIN" ? {} : { facilityId: user.facilityId },
      include: {
        medicine: true,
        facility: { select: { id: true, name: true, county: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json(stocks);
  } catch (err) {
    next(err);
  }
});

// Stock in: delivery received
router.post("/in", requireRole("PHARMACIST"), async (req, res, next) => {
  try {
    const parsed = movementSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const { medicineId, quantity, note } = parsed.data;
    const user = req.user!;

    const medicine = await prisma.medicine.findUnique({ where: { id: medicineId } });
    if (!medicine) throw httpError(404, "Medicine not found");

    const stock = await prisma.$transaction(async (tx) => {
      const updated = await tx.stock.upsert({
        where: { facilityId_medicineId: { facilityId: user.facilityId, medicineId } },
        update: { quantity: { increment: quantity } },
        create: { facilityId: user.facilityId, medicineId, quantity },
      });

      await tx.stockTransaction.create({
        data: { type: "STOCK_IN", quantity, note, stockId: updated.id, userId: user.id },
      });

      // Back above the threshold: close any open alert
      if (updated.quantity > updated.lowStockThreshold) {
        await tx.alert.updateMany({
          where: { stockId: updated.id, resolvedAt: null },
          data: { resolvedAt: new Date() },
        });
      }
      return updated;
    });

    res.status(201).json(stock);
  } catch (err) {
    next(err);
  }
});

// Stock out: medicine dispensed
router.post("/out", requireRole("PHARMACIST"), async (req, res, next) => {
  try {
    const parsed = movementSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const { medicineId, quantity, note } = parsed.data;
    const user = req.user!;

    const stock = await prisma.$transaction(async (tx) => {
      // Decrease only if enough is available; this check and the update happen together
      const taken = await tx.stock.updateMany({
        where: { facilityId: user.facilityId, medicineId, quantity: { gte: quantity } },
        data: { quantity: { decrement: quantity } },
      });
      if (taken.count === 0) {
        throw httpError(400, "Not enough stock, or this medicine is not stocked here");
      }

      const updated = await tx.stock.findUniqueOrThrow({
        where: { facilityId_medicineId: { facilityId: user.facilityId, medicineId } },
      });

      await tx.stockTransaction.create({
        data: { type: "STOCK_OUT", quantity, note, stockId: updated.id, userId: user.id },
      });

      // At or below the threshold: raise an alert unless one is already open
      if (updated.quantity <= updated.lowStockThreshold) {
        const open = await tx.alert.findFirst({
          where: { stockId: updated.id, resolvedAt: null },
        });
        if (!open) {
          await tx.alert.create({
            data: { stockId: updated.id, quantityAtAlert: updated.quantity },
          });
        }
      }
      return updated;
    });

    res.status(201).json(stock);
  } catch (err) {
    next(err);
  }
});

export default router;