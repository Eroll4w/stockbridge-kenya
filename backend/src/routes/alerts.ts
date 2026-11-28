import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const user = req.user!;
    const alerts = await prisma.alert.findMany({
      where: {
        resolvedAt: null,
        ...(user.role === "ADMIN" ? {} : { stock: { facilityId: user.facilityId } }),
      },
      include: {
        stock: {
          include: { medicine: true, facility: { select: { id: true, name: true, county: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(alerts);
  } catch (err) {
    next(err);
  }
});

export default router;