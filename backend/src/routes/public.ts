import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/medicines", async (req, res, next) => {
  try {
    const name = typeof req.query.name === "string" ? req.query.name.trim() : "";
    if (name.length < 2) {
      return res.status(400).json({ error: "Search with at least 2 characters" });
    }

    const stocks = await prisma.stock.findMany({
      where: { medicine: { name: { contains: name, mode: "insensitive" } } },
      include: { medicine: true, facility: true },
      orderBy: { updatedAt: "desc" },
    });

    // Only safe fields: no exact quantities, no user data
    res.json(
      stocks.map((s) => ({
        medicine: { id: s.medicine.id, name: s.medicine.name, strength: s.medicine.strength, unit: s.medicine.unit },
        facility: {
          id: s.facility.id,
          name: s.facility.name,
          county: s.facility.county,
          address: s.facility.address,
          phone: s.facility.phone,
          latitude: s.facility.latitude,
          longitude: s.facility.longitude,
        },
        availability:
          s.quantity === 0 ? "OUT_OF_STOCK" : s.quantity <= s.lowStockThreshold ? "LOW" : "IN_STOCK",
        updatedAt: s.updatedAt,
      }))
    );
  } catch (err) {
    next(err);
  }
});

export default router;