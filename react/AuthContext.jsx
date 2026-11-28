import React, { createContext, useContext, useMemo, useState } from "react";
import { clearSession, loadSession, login, saveSession, signup } from "./api.js";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);
  const value = useMemo(
    () => ({
      user: session?.user || null,
      token: session?.token || null,
      async authenticate(mode, form) {
        const s = await (mode === "login" ? login : signup)(form);
        saveSession(s);
        setSession(s);
      },
      logout() {
        clearSession();
        setSession(null);
      },
    }),
    [session],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
