import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginView } from "./LoginView";
import { AuthProvider } from "../AuthContext";
import type { AuthService } from "../auth-service";
import type { User } from "../types";

const alice: User = { id: "1", email: "alice@example.com", displayName: "Alice" };

function createMockService(): AuthService {
  return {
    register: vi.fn().mockResolvedValue({ ok: true, user: alice, token: "tok" }),
    login: vi.fn().mockResolvedValue({ ok: true, user: alice, token: "tok" }),
    restoreSession: vi.fn().mockReturnValue(null),
    logout: vi.fn(),
  };
}

function renderLogin(service?: AuthService) {
  const svc = service ?? createMockService();
  return {
    service: svc,
    ...render(
      <AuthProvider authService={svc}>
        <LoginView />
      </AuthProvider>,
    ),
  };
}

describe("LoginView", () => {
  it("renders login form by default", () => {
    renderLogin();
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("can switch to register form", async () => {
    renderLogin();
    const user = userEvent.setup();
    await user.click(screen.getByText(/create an account/i));
    expect(screen.getByRole("heading", { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
  });

  it("submits login with email and password", async () => {
    const { service } = renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/password/i), "P@ssw0rd!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(service.login).toHaveBeenCalledWith("alice@example.com", "P@ssw0rd!");
  });

  it("submits register with all fields", async () => {
    const { service } = renderLogin();
    const user = userEvent.setup();

    await user.click(screen.getByText(/create an account/i));
    await user.type(screen.getByLabelText(/display name/i), "Alice");
    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "P@ssw0rd!");
    await user.type(screen.getByLabelText(/confirm password/i), "P@ssw0rd!");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(service.register).toHaveBeenCalledWith("alice@example.com", "P@ssw0rd!", "Alice");
  });

  it("shows client-side error when passwords do not match", async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.click(screen.getByText(/create an account/i));
    await user.type(screen.getByLabelText(/display name/i), "Alice");
    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "P@ssw0rd!");
    await user.type(screen.getByLabelText(/confirm password/i), "Different1!");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it("shows error from failed login", async () => {
    const service = createMockService();
    service.login = vi.fn().mockResolvedValue({ ok: false, error: "Invalid email or password" });
    renderLogin(service);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "bad@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });
});
