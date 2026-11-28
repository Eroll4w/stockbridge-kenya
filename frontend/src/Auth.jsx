import React, { useState } from "react";
import { Eye, EyeOff, Loader2, Plus, ShieldCheck, Stethoscope, UserRound } from "lucide-react";
import { useAuth } from "./AuthContext.jsx";
import { isDemo } from "./api.js";
import "./auth.css";

const roles = [
  { id: "Patient", icon: UserRound, note: "Find medicine near you" },
  { id: "Pharmacist", icon: Stethoscope, note: "Record and track stock" },
  { id: "Administrator", icon: ShieldCheck, note: "Oversee facilities" },
];

export default function Auth() {
  const { authenticate } = useAuth();
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("Patient");
  const [form, setForm] = useState({ name: "", identifier: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const signingUp = mode === "signup";
  // Admin accounts are never self-service, and login takes the role from the server.
  // Demo mode (no backend URL) keeps the picker on login so each view can be previewed.
  const showRoles = signingUp || isDemo;
  const options = signingUp ? roles.filter((r) => r.id !== "Administrator") : roles;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (signingUp && form.password.length < 8)
      return setError("Use a password with at least 8 characters.");
    setBusy(true);
    try {
      await authenticate(
        mode,
        signingUp
          ? { ...form, role }
          : { identifier: form.identifier, password: form.password, role: isDemo ? role : undefined },
      );
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-brand">
          <div className="brand-mark"><Plus size={23} strokeWidth={3} /></div>
          <strong>StockBridge</strong>
          <span>KENYA</span>
        </div>

        <h1>{signingUp ? "Create your account" : "Welcome back"}</h1>
        <p className="auth-sub">
          {signingUp ? "Choose how you'll use StockBridge." : "Log in with your account."}
        </p>

        <div className="auth-tabs" role="tablist">
          {["login", "signup"].map((m) => (
            <button
              type="button" role="tab" key={m}
              aria-selected={mode === m}
              className={mode === m ? "on" : ""}
              onClick={() => { setMode(m); setError(""); }}
            >
              {m === "login" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>

        {showRoles && (
          <fieldset className="role-pick">
            <legend>I am a</legend>
            {options.map(({ id, icon: Icon, note }) => (
              <label key={id} className={role === id ? "on" : ""}>
                <input type="radio" name="role" checked={role === id} onChange={() => setRole(id)} />
                <Icon size={18} />
                <b>{id}</b>
                <span>{note}</span>
              </label>
            ))}
          </fieldset>
        )}

        {signingUp && (
          <label className="field">Full name
            <input value={form.name} onChange={set("name")} autoComplete="name" required />
          </label>
        )}
        <label className="field">Email or phone number
          <input value={form.identifier} onChange={set("identifier")} autoComplete="username" required />
        </label>
        <label className="field">Password
          <span className="pw">
            <input
              type={show ? "text" : "password"} value={form.password} onChange={set("password")}
              autoComplete={signingUp ? "new-password" : "current-password"} required
            />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
        </label>

        <div className="auth-error" role="alert" aria-live="polite">{error}</div>

        <button className="primary-button auth-submit" disabled={busy}>
          {busy && <Loader2 size={16} className="spin" />}
          {signingUp ? "Create account" : "Log in"}
        </button>

        {isDemo && <p className="auth-demo">Demo mode: no server is connected, so any details will work.</p>}
      </form>
    </div>
  );
}
