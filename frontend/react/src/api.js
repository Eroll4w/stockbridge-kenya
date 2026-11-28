// Backend connection. Set VITE_API_URL in a .env file, e.g.
//   VITE_API_URL=https://api.yourdomain.co.ke
// With no URL set, the app runs in demo mode (no real accounts).
const BASE = import.meta.env.VITE_API_URL || "";
const KEY = "stockbridge_session";

export const ROLES = ["Patient", "Pharmacist", "Administrator"];

export const loadSession = () => {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
};
export const saveSession = (s) => localStorage.setItem(KEY, JSON.stringify(s));
export const clearSession = () => localStorage.removeItem(KEY);

export const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";

// Adjust the field names here if your backend answers differently.
function normalise(data) {
  const u = data.user || data;
  return {
    token: data.token || data.accessToken || null,
    user: {
      name: u.name || u.fullName || u.username || "there",
      role: u.role || "Patient",
      id: u.id || u._id || null,
    },
  };
}

async function post(path, body) {
  if (!BASE) {
    // Demo mode: no server, nothing is stored except the name and role.
    const name = body.name || body.identifier.split("@")[0];
    return { token: "demo", user: { name, role: body.role } };
  }
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Can't reach the server. Check your connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || "Something went wrong. Try again.");
  return data;
}

export const login = async (b) => normalise(await post("/auth/login", b));
export const signup = async (b) => normalise(await post("/auth/signup", b));
export const isDemo = !BASE;
