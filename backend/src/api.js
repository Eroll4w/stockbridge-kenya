const API = (import.meta.env?.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export async function api(path, { method = "GET", body } = {}) {
  const token = globalThis.localStorage?.getItem("token");
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export async function login(email, password) {
  const { token, user } = await api("/auth/login", {
    method: "POST",
    body: { email, password },
  });

  globalThis.localStorage?.setItem("token", token);
  globalThis.localStorage?.setItem("user", JSON.stringify(user));
  return { token, user };
}