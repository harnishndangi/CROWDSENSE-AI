"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error || "Failed to sign up");
        setLoading(false);
      } else {
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/commuter");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong during signup.");
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
      {/* LEFT — Form Panel */}
      <div style={{
        flex: 1,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "var(--space-10) var(--space-8)",
      }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

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
            JOIN THE NETWORK
          </div>

          <h1 className="display-lg" style={{
            color: "var(--text-on-dark)",
            margin: "0 0 8px",
          }}>
            Create Account
          </h1>
          <p className="body-md" style={{ color: "var(--neutral-500)", margin: "0 0 32px" }}>
            Join the prediction network. Beat the crowd.
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
          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label className="label-caps" style={{
                display: "block", marginBottom: 8,
                color: "var(--neutral-400)",
              }}>Full Name</label>
              <input
                name="fullName" required type="text"
                placeholder="Riya Sharma"
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
              }}>Email Address</label>
              <input
                name="email" required type="email"
                placeholder="riya@example.com"
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
              }}>Secure Password</label>
              <input
                name="password" required type="password"
                placeholder="••••••••"
                minLength={6}
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
              {loading ? "Registering..." : "Create Account →"}
            </button>
          </form>

          {/* Links */}
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="body-md" style={{ color: "var(--neutral-500)" }}>
              Already have an account?{" "}
              <Link href="/login" style={{
                color: "var(--color-accent)",
                textDecoration: "none",
                fontWeight: 600,
                borderBottom: "1px solid var(--color-accent)",
                paddingBottom: 1,
              }}>Log In</Link>
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

      {/* RIGHT — Branding Panel */}
      <div className="hide-mobile" style={{
        width: "45%",
        background: "var(--color-accent)",
        display: "flex", flexDirection: "column",
        justifyContent: "space-between",
        padding: "var(--space-12) var(--space-10)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Grid overlay */}
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

        {/* Top — Stats */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 2, marginBottom: 40,
          }}>
            {[
              { n: "14M+", l: "Daily Commuters" },
              { n: "5+", l: "Signal Sources" },
              { n: "90%+", l: "Accuracy" },
              { n: "24/7", l: "Monitoring" },
            ].map(s => (
              <div key={s.l} style={{
                background: "rgba(10,10,10,0.1)",
                padding: "20px 16px",
              }}>
                <div className="font-heading" style={{ fontSize: 28, fontWeight: 800, color: "var(--text-on-accent)", lineHeight: 1 }}>
                  {s.n}
                </div>
                <div className="stat-label" style={{ color: "var(--color-black)", opacity: 0.6, marginTop: 4 }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle — Big text */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <h2 className="font-display" style={{
            fontSize: "clamp(40px, 5vw, 72px)",
            lineHeight: 0.92,
            color: "var(--text-on-accent)",
            margin: "0 0 20px",
          }}>
            BEAT<br />THE<br />RUSH
          </h2>
          <p className="body-md" style={{ color: "var(--color-black)", opacity: 0.6, maxWidth: 280 }}>
            Join thousands of Mumbaikars who navigate smarter with AI-powered crowd predictions.
          </p>
        </div>

        {/* Bottom */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <span className="meta-text" style={{ color: "var(--color-black)", opacity: 0.4 }}>
            CrowdSense Mumbai · v2.0
          </span>
        </div>
      </div>
    </div>
  );
}
