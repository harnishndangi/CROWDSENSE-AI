"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error || "Failed to login");
        setLoading(false);
      } else {
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/commuter");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong during login.");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-section-alt)",
      display: "flex",
      fontFamily: "var(--font-body)",
    }}>
      {/* LEFT — Branding Panel */}
      <div className="hide-mobile" style={{
        width: "45%",
        background: "var(--color-accent)",
        display: "flex", flexDirection: "column",
        justifyContent: "space-between",
        padding: "var(--space-12) var(--space-10)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative grid lines */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(var(--color-accent-dark) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-accent-dark) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          opacity: 0.15,
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40,
              background: "var(--color-black)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span className="font-display" style={{ fontSize: 18, color: "var(--text-on-dark)", lineHeight: 1 }}>CS</span>
            </div>
            <span className="font-display" style={{ fontSize: 24, color: "var(--text-on-accent)", letterSpacing: "0.02em" }}>
              CROWDSENSE
            </span>
          </div>
        </Link>

        {/* Hero text */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <h2 className="font-display" style={{
            fontSize: "clamp(48px, 6vw, 80px)",
            lineHeight: 0.92,
            color: "var(--text-on-accent)",
            margin: "0 0 24px",
          }}>
            PREDICT<br />THE<br />CROWD
          </h2>
          <p className="body-lg" style={{ color: "var(--color-black)", opacity: 0.7, maxWidth: 320 }}>
            Signal-aware urban intelligence for Mumbai&apos;s 14 million daily commuters.
          </p>
        </div>

        {/* Bottom tag */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <span className="meta-text" style={{ color: "var(--color-black)", opacity: 0.5 }}>
            Hack4Innovation 2026 · Team Technexis
          </span>
        </div>
      </div>

      {/* RIGHT — Login Form */}
      <div style={{
        flex: 1,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "var(--space-10) var(--space-8)",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>

          {/* Mobile logo */}
          <div className="hide-desktop" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
            <div style={{
              width: 36, height: 36, background: "var(--color-accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span className="font-display" style={{ fontSize: 16, color: "var(--text-on-accent)", lineHeight: 1 }}>CS</span>
            </div>
            <span className="font-display" style={{ fontSize: 20, color: "var(--text-on-dark)", letterSpacing: "0.02em" }}>
              CROWDSENSE<span style={{ color: "var(--color-accent)" }}> MUMBAI</span>
            </span>
          </div>

          {/* Section label */}
          <div className="section-label section-label--on-dark" style={{ marginBottom: 12 }}>
            AUTHENTICATE
          </div>

          <h1 className="display-lg" style={{
            color: "var(--text-on-dark)",
            margin: "0 0 8px",
          }}>
            Welcome Back
          </h1>
          <p className="body-md" style={{ color: "var(--neutral-500)", margin: "0 0 32px" }}>
            Login to access your commuter dashboard.
          </p>

          {/* Error */}
          {errorMsg && (
            <div style={{
              background: "rgba(239,68,68,0.08)",
              border: "2px solid #EF4444",
              color: "#EF4444",
              padding: "12px 16px",
              fontSize: 13,
              fontFamily: "var(--font-body)",
              marginBottom: 20,
            }}>
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label className="label-caps" style={{
                display: "block", marginBottom: 8,
                color: "var(--neutral-400)",
              }}>Email Address</label>
              <input
                name="email" required type="email"
                placeholder="mumbaikar@example.com"
                style={{
                  width: "100%",
                  background: "var(--color-black-soft)",
                  border: "2px solid var(--border-on-dark)",
                  color: "var(--text-on-dark)",
                  padding: "14px 16px",
                  fontSize: 14,
                  fontFamily: "var(--font-body)",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--color-accent)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--border-on-dark)")}
              />
            </div>

            <div>
              <label className="label-caps" style={{
                display: "block", marginBottom: 8,
                color: "var(--neutral-400)",
              }}>Password</label>
              <input
                name="password" required type="password"
                placeholder="••••••••"
                style={{
                  width: "100%",
                  background: "var(--color-black-soft)",
                  border: "2px solid var(--border-on-dark)",
                  color: "var(--text-on-dark)",
                  padding: "14px 16px",
                  fontSize: 14,
                  fontFamily: "var(--font-body)",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--color-accent)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--border-on-dark)")}
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              style={{
                marginTop: 8,
                padding: "16px",
                background: loading ? "var(--neutral-700)" : "var(--color-accent)",
                color: loading ? "var(--neutral-400)" : "var(--text-on-accent)",
                border: "none",
                fontFamily: "var(--font-condensed)",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.background = "var(--color-black)";
                  e.currentTarget.style.color = "var(--text-on-dark)";
                  e.currentTarget.style.outline = "2px solid var(--color-accent)";
                  e.currentTarget.style.outlineOffset = "4px";
                }
              }}
              onMouseLeave={e => {
                if (!loading) {
                  e.currentTarget.style.background = "var(--color-accent)";
                  e.currentTarget.style.color = "var(--text-on-accent)";
                  e.currentTarget.style.outline = "none";
                }
              }}
            >
              {loading ? "Authenticating..." : "Login to System →"}
            </button>
          </form>

          {/* Links */}
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="body-md" style={{ color: "var(--neutral-500)" }}>
              Need an account?{" "}
              <Link href="/signup" style={{
                color: "var(--color-accent)",
                textDecoration: "none",
                fontWeight: 600,
                borderBottom: "1px solid var(--color-accent)",
                paddingBottom: 1,
              }}>Sign Up</Link>
            </div>
            <Link href="/" className="body-md" style={{
              color: "var(--neutral-500)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-accent)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--neutral-500)")}
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
