import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const router = Router();

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid email or password" });

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not configured");

    const token = jwt.sign(
      { id: user.id, role: user.role, facilityId: user.facilityId },
      secret,
      { expiresIn: "12h" }
    );
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        facilityId: user.facilityId,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
