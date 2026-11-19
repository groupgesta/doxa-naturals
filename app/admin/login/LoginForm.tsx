"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { signIn, useAdminSession } from "../../lib/auth";
import Spinner from "../../components/Spinner";

export default function LoginForm() {
  const router = useRouter();
  const session = useAdminSession();
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) router.replace("/admin");
  }, [session, router]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    if (!email.includes("@")) return setError("Enter a valid email address.");
    if (!password) return setError("Enter your password.");
    setError("");
    setBusy(true);
    const err = await signIn(email, password);
    setBusy(false);
    if (err) return setError(err);
    router.replace("/admin");
  }

  return (
    <main className="login">
      <div className="login-art" aria-hidden="true">
        <Image
          src="/images/story.png"
          alt=""
          fill
          sizes="(max-width: 800px) 0px, 50vw"
        />
      </div>
      <div className="login-panel">
        <form className="login-card" onSubmit={onSubmit} noValidate>
          <Image
            src="/images/logo.png"
            alt="Doxa Naturals"
            width={1208}
            height={587}
            className="login-logo"
          />
          <div className="kicker">Admin</div>
          <h1>Welcome back.</h1>
          <p className="login-sub">
            Sign in to manage your products and stock.
          </p>

          <label className="field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              autoComplete="username"
              placeholder="you@doxanaturals.com"
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <div className="pw">
              <input
                name="password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-pressed={show}
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button className="btn" type="submit" disabled={busy}>
            {busy ? <><Spinner /> Signing in</> : "Sign in"}
          </button>

          <Link className="back-link" href="/">
            ← Back to the shop
          </Link>
        </form>
      </div>
    </main>
  );
}
