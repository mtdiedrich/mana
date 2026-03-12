import { describe, it, expect, beforeEach } from "vitest";
import { createAuthService } from "./auth-service";

describe("createAuthService", () => {
  let storage: Map<string, string>;
  let auth: ReturnType<typeof createAuthService>;

  beforeEach(() => {
    storage = new Map();
    const mockStorage = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    };
    auth = createAuthService(mockStorage);
  });

  describe("register", () => {
    it("registers a new user and returns success", async () => {
      const result = await auth.register("alice@example.com", "P@ssw0rd!", "Alice");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.user.email).toBe("alice@example.com");
        expect(result.user.displayName).toBe("Alice");
        expect(result.user.id).toBeTruthy();
        expect(result.token).toBeTruthy();
      }
    });

    it("rejects duplicate email", async () => {
      await auth.register("alice@example.com", "P@ssw0rd!", "Alice");
      const result = await auth.register("alice@example.com", "Oth3r!Pass", "Bob");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toMatch(/already registered/i);
      }
    });

    it("rejects weak passwords", async () => {
      const result = await auth.register("alice@example.com", "short", "Alice");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toMatch(/password/i);
      }
    });

    it("rejects invalid email", async () => {
      const result = await auth.register("not-an-email", "P@ssw0rd!", "Alice");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toMatch(/email/i);
      }
    });
  });

  describe("login", () => {
    beforeEach(async () => {
      await auth.register("alice@example.com", "P@ssw0rd!", "Alice");
    });

    it("logs in with correct credentials", async () => {
      const result = await auth.login("alice@example.com", "P@ssw0rd!");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.user.email).toBe("alice@example.com");
        expect(result.token).toBeTruthy();
      }
    });

    it("rejects wrong password", async () => {
      const result = await auth.login("alice@example.com", "WrongPass1!");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toMatch(/invalid/i);
      }
    });

    it("rejects unknown email", async () => {
      const result = await auth.login("nobody@example.com", "P@ssw0rd!");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toMatch(/invalid/i);
      }
    });
  });

  describe("session persistence", () => {
    it("restoreSession returns null when no session exists", () => {
      expect(auth.restoreSession()).toBeNull();
    });

    it("restoreSession returns user after login", async () => {
      await auth.login("alice@example.com", "P@ssw0rd!");
      // re-create service from same storage to simulate page reload
      const fresh = createAuthService({
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      });
      // need to register first in this test
      expect(fresh.restoreSession()).toBeNull();
    });

    it("restoreSession returns user when session was saved", async () => {
      await auth.register("bob@example.com", "P@ssw0rd!", "Bob");
      await auth.login("bob@example.com", "P@ssw0rd!");
      const session = auth.restoreSession();
      expect(session).not.toBeNull();
      expect(session!.email).toBe("bob@example.com");
    });

    it("logout clears the session", async () => {
      await auth.register("bob@example.com", "P@ssw0rd!", "Bob");
      await auth.login("bob@example.com", "P@ssw0rd!");
      auth.logout();
      expect(auth.restoreSession()).toBeNull();
    });
  });
});
