import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/summary", async (req, res, next) => {
  try {
    const user = req.user!;
    const scope = user.role === "ADMIN" ? {} : { facilityId: user.facilityId };

    const [stock, recentMovements, activeAlerts] = await Promise.all([
      prisma.stock.findMany({
        where: scope,
        include: { medicine: true, facility: { select: { id: true, name: true } } },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.stockTransaction.findMany({
        where: { stock: scope },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          stock: { include: { medicine: true, facility: { select: { name: true } } } },
          user: { select: { name: true } },
        },
      }),
      prisma.alert.findMany({
        where: { resolvedAt: null, stock: scope },
        orderBy: { createdAt: "desc" },
        include: {
          stock: { include: { medicine: true, facility: { select: { name: true } } } },
        },
      }),
    ]);

    res.json({
      totals: {
        items: stock.length,
        outOfStock: stock.filter((s) => s.quantity === 0).length,
        lowStock: stock.filter((s) => s.quantity > 0 && s.quantity <= s.lowStockThreshold).length,
        activeAlerts: activeAlerts.length,
      },
      stock,
      recentMovements,
      activeAlerts,
    });
  } catch (err) {
    next(err);
  }
});

export default router;