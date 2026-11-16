"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { signIn, useAdminSession } from "../../lib/auth";

export default function LoginForm() {
  const router = useRouter();
  const session = useAdminSession();
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session) router.replace("/admin");
  }, [session, router]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    if (!email.includes("@")) return setError("Enter a valid email address.");
    if (password.length < 6)
      return setError("Password must be at least 6 characters.");
    setError("");
    signIn();
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

          <button className="btn" type="submit">
            Sign in
          </button>

          <p className="demo-note">
            Demo mode: any email and a password of 6+ characters will sign you
            in. Real authentication comes with the backend.
          </p>
          <Link className="back-link" href="/">
            ← Back to the shop
          </Link>
        </form>
      </div>
    </main>
  );
}
