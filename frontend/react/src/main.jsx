import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import Auth from "./Auth.jsx";
import { AuthProvider, useAuth } from "./AuthContext.jsx";
import "./styles.css";

function Gate() {
  const { user, logout } = useAuth();
  return user ? <App user={user} onLogout={logout} /> : <Auth />;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <Gate />
    </AuthProvider>
  </React.StrictMode>,
);
