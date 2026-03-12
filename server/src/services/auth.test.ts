import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createTestPrisma } from "../test-helpers.js";
import { register, login, verifyToken } from "./auth.js";

describe("Auth Service", () => {
  let prisma: PrismaClient;

  beforeEach(async () => {
    const ctx = await createTestPrisma();
    prisma = ctx.prisma;
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  describe("register", () => {
    it("creates a new user and returns a token", async () => {
      const result = await register(prisma, {
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      });

      expect(result.user.email).toBe("test@example.com");
      expect(result.user.displayName).toBe("Test User");
      expect(result.user.id).toBeDefined();
      expect(result.token).toBeDefined();
      // Should not expose password hash
      expect((result.user as Record<string, unknown>).passwordHash).toBeUndefined();
    });

    it("rejects duplicate emails", async () => {
      await register(prisma, {
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      });

      await expect(
        register(prisma, {
          email: "test@example.com",
          password: "password456",
          displayName: "Another User",
        })
      ).rejects.toThrow("Email already registered");
    });

    it("rejects invalid email format", async () => {
      await expect(
        register(prisma, {
          email: "not-an-email",
          password: "password123",
          displayName: "Test User",
        })
      ).rejects.toThrow("Invalid email");
    });

    it("rejects short passwords", async () => {
      await expect(
        register(prisma, {
          email: "test@example.com",
          password: "short",
          displayName: "Test User",
        })
      ).rejects.toThrow("Password must be at least 8 characters");
    });

    it("rejects empty display name", async () => {
      await expect(
        register(prisma, {
          email: "test@example.com",
          password: "password123",
          displayName: "",
        })
      ).rejects.toThrow("Display name is required");
    });
  });

  describe("login", () => {
    beforeEach(async () => {
      await register(prisma, {
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      });
    });

    it("returns user and token for valid credentials", async () => {
      const result = await login(prisma, {
        email: "test@example.com",
        password: "password123",
      });

      expect(result.user.email).toBe("test@example.com");
      expect(result.token).toBeDefined();
    });

    it("rejects wrong password", async () => {
      await expect(
        login(prisma, {
          email: "test@example.com",
          password: "wrongpassword",
        })
      ).rejects.toThrow("Invalid email or password");
    });

    it("rejects non-existent email", async () => {
      await expect(
        login(prisma, {
          email: "nobody@example.com",
          password: "password123",
        })
      ).rejects.toThrow("Invalid email or password");
    });
  });

  describe("verifyToken", () => {
    it("returns user ID for a valid token", async () => {
      const result = await register(prisma, {
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      });

      const payload = verifyToken(result.token);
      expect(payload.userId).toBe(result.user.id);
    });

    it("throws for an invalid token", () => {
      expect(() => verifyToken("garbage-token")).toThrow();
    });
  });
});
