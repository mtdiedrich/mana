import type { AuthResponse, User } from "./types";

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface StoredUser {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
}

const USERS_KEY = "grimoire_users";
const SESSION_KEY = "grimoire_session";

function generateId(): string {
  return crypto.randomUUID();
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password: string): boolean {
  return password.length >= 8;
}

function getUsers(storage: StorageAdapter): StoredUser[] {
  const raw = storage.getItem(USERS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as StoredUser[];
}

function saveUsers(storage: StorageAdapter, users: StoredUser[]): void {
  storage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveSession(storage: StorageAdapter, user: User, token: string): void {
  storage.setItem(SESSION_KEY, JSON.stringify({ user, token }));
}

export function createAuthService(storage: StorageAdapter) {
  return {
    async register(
      email: string,
      password: string,
      displayName: string,
    ): Promise<AuthResponse> {
      if (!isValidEmail(email)) {
        return { ok: false, error: "Invalid email address" };
      }
      if (!isStrongPassword(password)) {
        return { ok: false, error: "Password must be at least 8 characters" };
      }

      const users = getUsers(storage);
      if (users.some((u) => u.email === email)) {
        return { ok: false, error: "Email already registered" };
      }

      const id = generateId();
      const passwordHash = await hashPassword(password);
      users.push({ id, email, displayName, passwordHash });
      saveUsers(storage, users);

      const user: User = { id, email, displayName };
      const token = generateId();
      saveSession(storage, user, token);

      return { ok: true, user, token };
    },

    async login(email: string, password: string): Promise<AuthResponse> {
      const users = getUsers(storage);
      const passwordHash = await hashPassword(password);
      const found = users.find(
        (u) => u.email === email && u.passwordHash === passwordHash,
      );

      if (!found) {
        return { ok: false, error: "Invalid email or password" };
      }

      const user: User = {
        id: found.id,
        email: found.email,
        displayName: found.displayName,
      };
      const token = generateId();
      saveSession(storage, user, token);

      return { ok: true, user, token };
    },

    restoreSession(): User | null {
      const raw = storage.getItem(SESSION_KEY);
      if (!raw) return null;
      try {
        const session = JSON.parse(raw) as { user: User; token: string };
        return session.user;
      } catch {
        return null;
      }
    },

    logout(): void {
      storage.removeItem(SESSION_KEY);
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
