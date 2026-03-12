import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import type { AuthService } from "./auth-service";
import type { User } from "./types";

const alice: User = { id: "1", email: "alice@example.com", displayName: "Alice" };

function createMockService(initialUser: User | null = null): AuthService {
  return {
    register: vi.fn().mockResolvedValue({ ok: true, user: alice, token: "tok" }),
    login: vi.fn().mockResolvedValue({ ok: true, user: alice, token: "tok" }),
    restoreSession: vi.fn().mockReturnValue(initialUser),
    logout: vi.fn(),
  };
}

function TestConsumer() {
  const { user, loading, error, login, register, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.displayName : "none"}</span>
      <span data-testid="error">{error ?? "none"}</span>
      <button onClick={() => login("a@b.com", "pass")}>login</button>
      <button onClick={() => register("a@b.com", "pass", "A")}>register</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  it("starts with no user and loading false after init", () => {
    const service = createMockService();
    render(
      <AuthProvider authService={service}>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId("user").textContent).toBe("none");
    expect(screen.getByTestId("loading").textContent).toBe("false");
  });

  it("restores session on mount", () => {
    const service = createMockService(alice);
    render(
      <AuthProvider authService={service}>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId("user").textContent).toBe("Alice");
  });

  it("login sets user on success", async () => {
    const service = createMockService();
    render(
      <AuthProvider authService={service}>
        <TestConsumer />
      </AuthProvider>,
    );
    await act(async () => {
      screen.getByText("login").click();
    });
    expect(screen.getByTestId("user").textContent).toBe("Alice");
    expect(screen.getByTestId("error").textContent).toBe("none");
  });

  it("login sets error on failure", async () => {
    const service = createMockService();
    service.login = vi.fn().mockResolvedValue({ ok: false, error: "Bad creds" });
    render(
      <AuthProvider authService={service}>
        <TestConsumer />
      </AuthProvider>,
    );
    await act(async () => {
      screen.getByText("login").click();
    });
    expect(screen.getByTestId("user").textContent).toBe("none");
    expect(screen.getByTestId("error").textContent).toBe("Bad creds");
  });

  it("register sets user on success", async () => {
    const service = createMockService();
    render(
      <AuthProvider authService={service}>
        <TestConsumer />
      </AuthProvider>,
    );
    await act(async () => {
      screen.getByText("register").click();
    });
    expect(screen.getByTestId("user").textContent).toBe("Alice");
  });

  it("logout clears user", async () => {
    const service = createMockService(alice);
    render(
      <AuthProvider authService={service}>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId("user").textContent).toBe("Alice");
    await act(async () => {
      screen.getByText("logout").click();
    });
    expect(screen.getByTestId("user").textContent).toBe("none");
    expect(service.logout).toHaveBeenCalled();
  });
});
