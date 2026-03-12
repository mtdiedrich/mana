import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { config } from "../config.js";
import type { AuthResult, UserPublic } from "../types.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
}

function toPublicUser(user: { id: string; email: string; displayName: string }): UserPublic {
  return { id: user.id, email: user.email, displayName: user.displayName };
}

function signToken(userId: string): string {
  return jwt.sign({ userId } satisfies TokenPayload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
}

export async function register(prisma: PrismaClient, input: RegisterInput): Promise<AuthResult> {
  if (!EMAIL_REGEX.test(input.email)) {
    throw new Error("Invalid email");
  }
  if (input.password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  if (!input.displayName.trim()) {
    throw new Error("Display name is required");
  }

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new Error("Email already registered");
  }

  const passwordHash = await bcryptjs.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      displayName: input.displayName.trim(),
      passwordHash,
    },
  });

  return {
    user: toPublicUser(user),
    token: signToken(user.id),
  };
}

export async function login(prisma: PrismaClient, input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const valid = await bcryptjs.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new Error("Invalid email or password");
  }

  return {
    user: toPublicUser(user),
    token: signToken(user.id),
  };
}

export async function getUser(prisma: PrismaClient, userId: string): Promise<UserPublic | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, displayName: true },
  });
  return user;
}
