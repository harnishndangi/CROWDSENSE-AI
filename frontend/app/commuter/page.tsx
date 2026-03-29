"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CommuterTab from "../components/CommuterTab";
import { supabase } from "../lib/supabaseClient";
import { useAuthGuard } from "../lib/useAuthGuard";

/* ─── Data ─────────────────────────────────────── */
const TICKER_ALERTS_FALLBACK = [
  "VERY HIGH — Dadar Station · 847 pax on platform 3",
  "MEDIUM — Andheri Metro · 320 pax · Wait 4 min",
  "LOW — CST Terminus · 112 pax · All clear",
  "AI ALERT — Agent predicts WEH congestion by 18:30",
  "MONSOON — Scattered showers Andheri / Borivali",
];

export default function CommuterPage() {
  const { userName, isLoading, logout } = useAuthGuard();
  const [tickerIdx, setTickerIdx] = useState(0);
  const [tickerKey, setTickerKey] = useState(0);
  const [time, setTime] = useState("");
  const [tickerAlerts, setTickerAlerts] = useState<string[]>(TICKER_ALERTS_FALLBACK);

  useEffect(() => {
    if (isLoading) return;

    const fetchData = async () => {
      try {
        const { data: alerts } = await supabase.from('ticker_alerts').select('message');
        if (alerts && alerts.length > 0) {
          setTickerAlerts(alerts.map(a => a.message));
        }
      } catch (err) {
        console.warn('Failed to fetch from supabase', err);
      }
    };
    fetchData();

    const sub = supabase
      .channel('commuter_live_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ticker_alerts' }, payload => {
        setTickerAlerts(prev => [...prev, (payload.new as any).message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [isLoading]);

  useEffect(() => {
    const iv = setInterval(() => {
      setTickerIdx(i => (i + 1) % (tickerAlerts.length || 1));
      setTickerKey(k => k + 1);
    }, 5000);
    return () => clearInterval(iv);
  }, [tickerAlerts.length]);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
        })
      );
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  const handleLogout = async () => {
    logout();
  };

  if (isLoading) return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#444", letterSpacing: "0.1em" }}>AUTHENTICATING...</div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--bg-page)",
      color: "var(--text-primary)",
      fontFamily: "var(--font-body)",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ═══════════════════════════════════════════════
          BRUTALIST HEADER
          ═══════════════════════════════════════════════ */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "var(--bg-nav)",
        color: "var(--text-on-dark)",
        borderBottom: "2px solid var(--color-black)",
      }}>
        <div style={{
          height: "var(--nav-height)",
          padding: "0 var(--container-padding)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <span className="font-display" style={{ fontSize: 28, color: "var(--text-on-dark)" }}>
              CROWDSENSE <span style={{ color: "var(--color-accent)" }}>MUMBAI</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hide-mobile" style={{ display: "flex", gap: 32, alignItems: "center" }}>
            <Link href="/map" className="nav-link" style={{ color: "var(--text-on-dark)" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--color-accent)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-on-dark)"}
            >MAP VIEW</Link>
            <Link href="/" className="nav-link" style={{ color: "var(--text-on-dark)" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--color-accent)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-on-dark)"}
            >HOME</Link>
          </div>

          {/* Right side — user + logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, background: "var(--crowd-low)" }} className="animate-live" />
              <span className="nav-link" style={{ color: "var(--text-on-dark)" }}>{userName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="btn-accent"
              style={{
                fontFamily: "var(--font-condensed)",
                padding: "8px 16px",
                fontSize: 13,
                border: "2px solid var(--color-black)",
                background: "var(--color-accent)",
                color: "var(--color-black)",
                fontWeight: 700,
              }}
            >
              LOGOUT
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            TICKER STRIP (Now a raw, highly visible strip)
            ═══════════════════════════════════════════════ */}
        <div style={{ 
          background: "var(--color-black)", 
          borderTop: "1px solid var(--border-on-dark)",
          padding: "8px var(--container-padding)",
          display: "flex", 
          alignItems: "center", 
          gap: 16
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, background: "var(--color-accent)" }} className="animate-live" />
            <span className="label-overline" style={{ color: "var(--color-accent)" }}>LIVE</span>
          </div>
          
          <div style={{ width: 2, height: 16, background: "var(--border-on-dark)" }} />

          <div style={{ flex: 1, overflow: "hidden" }}>
            <span
              key={tickerKey}
              className="ticker-anim body-sm"
              style={{ color: "var(--text-on-dark)", display: "block", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}
            >
              {tickerAlerts[tickerIdx] || ""}
            </span>
          </div>

          <div style={{ padding: "0 12px", borderLeft: "2px solid var(--border-on-dark)" }}>
            <span className="font-mono" style={{ fontSize: 13, color: "var(--text-on-dark)" }}>{time}</span>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════
          COMMUTER TAB CONTENT
          ═══════════════════════════════════════════════ */}
      <div style={{ flex: 1, backgroundColor: "var(--bg-page)" }}>
        <CommuterTab />
      </div>

      {/* ═══════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════ */}
      <footer style={{
        padding: "var(--space-8) var(--container-padding)",
        backgroundColor: "var(--color-black)",
        color: "var(--text-on-dark)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
        flexShrink: 0,
        borderTop: "3px solid var(--border-default)",
      }}>
        <span className="body-md" style={{ color: "var(--neutral-400)" }}>
          © 2026 CROWDSENSE MUMBAI
        </span>
        <div style={{ display: "flex", gap: 24 }}>
          {["API Docs", "Privacy", "GitHub", "Status"].map(l => (
            <a key={l} href="#" className="nav-link" style={{ color: "var(--neutral-400)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-accent)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--neutral-400)")}
            >{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}