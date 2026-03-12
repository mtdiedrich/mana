import { useState, type FormEvent, type CSSProperties } from "react";
import { useAuth } from "../AuthContext";
import { T } from "../constants";
import { inputStyle } from "../components/styles";

type Mode = "login" | "register";

const containerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "80vh",
};

const formBoxStyle: CSSProperties = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: 12,
  padding: "40px 36px",
  width: "100%",
  maxWidth: 400,
};

const headingStyle: CSSProperties = {
  fontFamily: "'Cinzel', serif",
  fontSize: 22,
  fontWeight: 700,
  color: T.accent,
  textAlign: "center",
  marginBottom: 24,
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 13,
  color: T.textMuted,
  marginBottom: 4,
};

const fieldStyle: CSSProperties = {
  marginBottom: 16,
};

const submitBtnStyle: CSSProperties = {
  width: "100%",
  padding: "12px 0",
  background: T.accent,
  color: T.bg,
  border: "none",
  borderRadius: 8,
  fontSize: 15,
  fontWeight: 600,
  fontFamily: "inherit",
  cursor: "pointer",
  marginTop: 8,
};

const switchStyle: CSSProperties = {
  textAlign: "center",
  marginTop: 16,
  fontSize: 13,
  color: T.textMuted,
};

const linkStyle: CSSProperties = {
  color: T.accent,
  background: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 13,
  textDecoration: "underline",
  padding: 0,
};

const errorStyle: CSSProperties = {
  background: T.dangerDim,
  color: T.danger,
  padding: "8px 12px",
  borderRadius: 6,
  fontSize: 13,
  marginBottom: 16,
};

export function LoginView() {
  const { login, register, error: authError } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const error = localError ?? authError;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);

    if (mode === "register") {
      if (password !== confirmPassword) {
        setLocalError("Passwords do not match");
        return;
      }
      await register(email, password, displayName);
    } else {
      await login(email, password);
    }
  }

  return (
    <div style={containerStyle}>
      <div style={formBoxStyle}>
        <h2 style={headingStyle}>
          {mode === "login" ? "Sign In" : "Create Account"}
        </h2>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div style={fieldStyle}>
              <label htmlFor="displayName" style={labelStyle}>
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                required
                style={inputStyle}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          )}

          <div style={fieldStyle}>
            <label htmlFor="email" style={labelStyle}>
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={fieldStyle}>
            <label htmlFor="password" style={labelStyle}>
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {mode === "register" && (
            <div style={fieldStyle}>
              <label htmlFor="confirmPassword" style={labelStyle}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                style={inputStyle}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          <button type="submit" style={submitBtnStyle}>
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div style={switchStyle}>
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                style={linkStyle}
                onClick={() => {
                  setMode("register");
                  setLocalError(null);
                }}
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                style={linkStyle}
                onClick={() => {
                  setMode("login");
                  setLocalError(null);
                }}
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
