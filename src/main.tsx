import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./AuthContext";
import { createAuthService } from "./auth-service";

const authService = createAuthService(localStorage);

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <AuthProvider authService={authService}>
      <App />
    </AuthProvider>
  </StrictMode>,
);
