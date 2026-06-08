import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prisma";
import { signToken, requireAuth } from "../middleware/auth";
import { HttpError } from "../middleware/error";
import { config } from "../config";

export const authRouter = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Public: lets the frontend decide whether to show first-run enrollment,
// normal login, or an open registration link — without exposing any data.
authRouter.get("/status", async (_req, res) => {
  const userCount = await prisma.user.count();
  res.json({
    needsSetup: userCount === 0,
    allowRegistration: userCount === 0 || config.allowOpenRegistration,
  });
});

authRouter.post("/register", async (req, res) => {
  const { email, password } = credentialsSchema.parse(req.body);
  const normalizedEmail = email.toLowerCase().trim();

  // First user is always allowed (first-run owner enrollment). After that,
  // registration is closed unless explicitly enabled via env.
  const userCount = await prisma.user.count();
  if (userCount > 0 && !config.allowOpenRegistration) {
    throw new HttpError(403, "Registration is closed. Please sign in instead.");
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw new HttpError(409, "An account with that email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email: normalizedEmail, passwordHash },
  });

  const token = signToken({ userId: user.id, email: user.email });
  res.status(201).json({ token, user: { id: user.id, email: user.email } });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = credentialsSchema.parse(req.body);
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    throw new HttpError(401, "Invalid email or password");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, "Invalid email or password");
  }

  const token = signToken({ userId: user.id, email: user.email });
  res.json({ token, user: { id: user.id, email: user.email } });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, createdAt: true },
  });
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  res.json({ user });
});
