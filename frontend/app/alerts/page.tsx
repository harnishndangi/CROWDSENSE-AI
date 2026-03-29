"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthGuard } from "../lib/useAuthGuard";
import { supabase } from "../lib/supabaseClient";
import { api } from "../lib/api";


const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: "⬡" },
  { label: "Commuter", href: "/commuter", icon: "🚆" },
  { label: "Analytics", href: "/analytics", icon: "📊" },
  { label: "Alerts", href: "/alerts", icon: "🔔" },
  { label: "Map", href: "/map", icon: "🗺" },
];

type Severity = "critical" | "high" | "moderate" | "info";

interface Alert {
  id: number;
  severity: Severity;
  location: string;
  mode: string;
  title: string;
  desc: string;
  time: string;
  crowd: number;
  active: boolean;
}

const INITIAL_ALERTS: Alert[] = [
  { id: 1, severity: "critical", location: "CSMT", mode: "Railway", title: "Extreme Overcrowding — Platform 3", desc: "Platform 3 at CSMT has exceeded safe capacity by 35%. Holding pattern active. Avoid entry until 20:00.", time: "Just now", crowd: 97, active: true },
  { id: 2, severity: "critical", location: "Dadar", mode: "Railway", title: "Crowd Surge — Western & Central Junction", desc: "Simultaneous WR + CR train arrivals causing surge at Dadar overbridge. AI predicts resolve by 19:45.", time: "3 min ago", crowd: 91, active: true },
  { id: 3, severity: "high", location: "Andheri Metro", mode: "Metro", title: "Metro L1 — Peak Overload", desc: "Metro Line 1 towards Versova operating at 88% capacity. Next 3 trains showing reduced wait times.", time: "8 min ago", crowd: 85, active: true },
  { id: 4, severity: "high", location: "Kurla", mode: "Railway", title: "Harbour Line Delay Impact", desc: "15-minute signal delay on Harbour Line causing platform backlog at Kurla. Alternate via CR main suggested.", time: "12 min ago", crowd: 78, active: true },
  { id: 5, severity: "moderate", location: "Borivali", mode: "Railway", title: "Rush Hour Build-Up", desc: "Western Railway northbound platforms building up ahead of evening peak. Crowd expected to peak at 19:00.", time: "18 min ago", crowd: 65, active: false },
  { id: 6, severity: "moderate", location: "Bandra", mode: "Bus", title: "BEST Route 221 — High Occupancy", desc: "Bus route 221 (Bandra–Kurla) operating at 72% load. Additional buses deployed at 18:30.", time: "22 min ago", crowd: 60, active: false },
  { id: 7, severity: "info", location: "Marine Lines", mode: "Railway", title: "Tide Advisory — Coastal Route", desc: "High tide expected at 18:20. Coastal train routes may experience minor delays. Plan 10 extra minutes.", time: "35 min ago", crowd: 42, active: false },
  { id: 8, severity: "info", location: "Ghatkopar", mode: "Metro", title: "Metro–Railway Interchange — Optimal", desc: "Metro Line 1 Ghatkopar interchange currently at low crowd (38%). Best time to use metro connection.", time: "40 min ago", crowd: 38, active: false },
];

const SEV_CONFIG: Record<Severity, { color: string; bg: string; border: string; label: string; icon: string }> = {
  critical: { color: "#EF4444", bg: "rgba(239,68,68,0.08)", border: "#7f1d1d", label: "CRITICAL", icon: "🚨" },
  high:     { color: "#F97316", bg: "rgba(249,115,22,0.07)", border: "#78350f", label: "HIGH",     icon: "⚠️" },
  moderate: { color: "#FDE047", bg: "rgba(253,224,71,0.06)", border: "#78350f", label: "MODERATE", icon: "🔶" },
  info:     { color: "#60A5FA", bg: "rgba(96,165,250,0.06)", border: "#1e3a5f", label: "INFO",     icon: "ℹ️" },
};

const FILTER_OPTIONS: (Severity | "all")[] = ["all", "critical", "high", "moderate", "info"];

export default function AlertsPage() {
  const { userName, isLoading: authLoading, logout } = useAuthGuard();
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [filter, setFilter] = useState<Severity | "all">("all");
  const [time, setTime] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userReport, setUserReport] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setTime(n.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  // Fetch real-time data from backend
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const hour = new Date().getHours();
        const data = await api.getCompare(hour);
        const locations = data.ranked_locations || [];
        
        let idCounter = 1;
        const newAlerts: Alert[] = [];
        
        for (const loc of locations) {
          const score = loc.crowd_score;
          if (score < 40) continue; // Show alerts from moderate and up
          
          let severity: Severity = "info";
          let active = false;
          let title = "";
          let desc = "";
          
          if (score >= 85) {
            severity = "critical";
            active = true;
            title = `Extreme Overcrowding — ${loc.location}`;
            desc = `${loc.location} has exceeded safe capacity. AI predicts high surge. Avoid entry if possible.`;
          } else if (score >= 75) {
            severity = "high";
            active = true;
            title = `Crowd Surge Detected`;
            desc = `High passenger volume at ${loc.location}. Expect delays and extended waiting times.`;
          } else if (score >= 60) {
            severity = "moderate";
            title = `Rush Hour Build-Up`;
            desc = `${loc.type === "railway" ? "Platform" : "Area"} building up ahead of peak. Crowd expected to rise.`;
          } else {
            severity = "info";
            title = `System Advisory`;
            desc = `Traffic flow is steady. Minor disruptions possible. Plan ahead.`;
          }
          
          newAlerts.push({
            id: idCounter++,
            severity,
            location: loc.location,
            mode: (loc.type.charAt(0).toUpperCase() + loc.type.slice(1)).replace("_", " "),
            title,
            desc,
            time: "Live API",
            crowd: score,
            active,
          });
        }
        
        let userAlerts: Alert[] = [];
        try {
          const { data: dbData } = await supabase
            .from("crowd_alerts")
            .select("*")
            .eq("active", true)
            .order("created_at", { ascending: false })
            .limit(10);
            
          if (dbData) {
            userAlerts = dbData.map(d => ({
              id: idCounter++,
              severity: d.severity as Severity,
              location: d.location,
              mode: d.mode,
              title: `[USER REPORT] ${d.title}`,
              desc: d.description,
              time: "Just now",
              crowd: d.crowd,
              active: d.active
            }));
          }
        } catch (e) {
          console.error("Supabase fetch error", e);
        }
        
        if (newAlerts.length > 0 || userAlerts.length > 0) {
          setAlerts([...userAlerts, ...newAlerts]);
        }
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
      }
    };
    
    fetchAlerts();
    const iv = setInterval(fetchAlerts, 10000);
    return () => clearInterval(iv);
  }, []);

  const filtered = filter === "all" ? alerts : alerts.filter(a => a.severity === filter);
  const activeCritical = alerts.filter(a => a.severity === "critical" && a.active).length;

  const handleReport = async () => {
    if (!userReport) return;
    try {
      const aiData = await api.postReportAI(userReport);
      if (aiData && aiData.status === "success") {
        await supabase.from("crowd_alerts").insert([aiData.data]);
      }
    } catch { /* ignore */ }
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setUserReport("");
  };

  return (
    <div className="bg-pattern-dark" style={{ minHeight: "100vh", fontFamily: "var(--font-body)", color: "#fff", position: "relative" }}>
      <div className="ambient-glow" />
      {authLoading && (
        <div style={{ position: "fixed", inset: 0, background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#444", letterSpacing: "0.1em" }}>AUTHENTICATING...</div>
        </div>
      )}
      {/* NAV */}
      <nav className="glass-dark" style={{ position: "sticky", top: 0, zIndex: 100, height: 72, borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", padding: "0 clamp(20px,5vw,64px)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "#000" }}>CS</span>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "#fff", letterSpacing: "0.02em" }}>CROWDSENSE<span style={{ color: "var(--color-accent)" }}> MUMBAI</span></span>
        </Link>
        <div className="hide-mobile" style={{ display: "flex", gap: 4, marginLeft: "auto", marginRight: 24, alignItems: "center" }}>
          {NAV_LINKS.map(n => (
            <Link key={n.label} href={n.href} className="nav-link" style={{ color: n.href === "/alerts" ? "var(--color-accent)" : "#666", padding: "8px 14px", display: "flex", alignItems: "center", gap: 6, fontSize: 12, borderBottom: n.href === "/alerts" ? "2px solid var(--color-accent)" : "2px solid transparent" }}>{n.icon} {n.label}</Link>
          ))}
          <div style={{ width: 1, height: 20, background: "#333", margin: "0 8px" }} />
          <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 12px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", display: "inline-block", animation: "live-pulse 1.4s ease-in-out infinite" }} />
            <span style={{ fontFamily: "var(--font-condensed)", fontSize: 11, color: "#22C55E", letterSpacing: "0.06em", fontWeight: 700 }}>{userName}</span>
          </div>
        </div>
        <button onClick={logout} className="hide-mobile" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", padding: "8px 16px", fontFamily: "var(--font-condensed)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.15)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}>
          Logout
        </button>
        <button className="hide-desktop" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer" }}>{mobileMenuOpen ? "×" : "≡"}</button>
      </nav>

      {/* CRITICAL BANNER */}
      {activeCritical > 0 && (
        <div style={{ background: "rgba(239,68,68,0.12)", borderBottom: "1px solid #7f1d1d", padding: "12px clamp(20px,5vw,64px)", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", display: "inline-block", animation: "live-pulse 1.4s ease-in-out infinite" }} />
          <span style={{ fontFamily: "var(--font-condensed)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#EF4444" }}>
            {activeCritical} CRITICAL ALERT{activeCritical > 1 ? "S" : ""} ACTIVE — Avoid CSMT &amp; Dadar during peak hours
          </span>
          <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 10, color: "#666" }}>{time} IST</span>
        </div>
      )}

      {/* HEADER */}
      <div className="glass-dark" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "40px clamp(20px,5vw,64px)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 300, height: 300, background: "radial-gradient(circle, rgba(255, 224, 102, 0.1) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: "var(--font-condensed)", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#888", marginBottom: 12 }}>
            Alert Center · {time} IST · Auto-refreshing
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,72px)", lineHeight: 0.93, color: "#fff", margin: "0 0 8px" }}>
            CROWD <span style={{ color: "var(--color-accent)" }}>ALERTS</span>
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#666", maxWidth: 600 }}>
            Real-time crowd surge notifications across all Mumbai transit modes — railways, metro, buses, ferries. Critical alerts trigger AI route advisory.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px clamp(20px,5vw,64px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

          {/* ALERT FEED */}
          <div>
            {/* Summary Stats */}
            <div className="glass-panel" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, marginBottom: 32, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
              {[
                { label: "Critical", count: alerts.filter(a => a.severity === "critical").length, color: "#EF4444" },
                { label: "High", count: alerts.filter(a => a.severity === "high").length, color: "#F97316" },
                { label: "Moderate", count: alerts.filter(a => a.severity === "moderate").length, color: "#FDE047" },
                { label: "Info", count: alerts.filter(a => a.severity === "info").length, color: "#60A5FA" },
              ].map((s, i) => (
                <div key={s.label} style={{ padding: "20px", background: "rgba(0,0,0,0.3)", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.count}</div>
                  <div style={{ fontFamily: "var(--font-condensed)", fontSize: 11, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filter Bar */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              {FILTER_OPTIONS.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: "10px 20px",
                  background: filter === f ? (f === "all" ? "var(--color-accent)" : SEV_CONFIG[f as Severity]?.color || "var(--color-accent)") : "rgba(25,25,25,0.4)",
                  border: `1px solid ${filter === f ? "transparent" : "rgba(255,255,255,0.08)"}`,
                  color: filter === f ? "#000" : "#999",
                  borderRadius: 8,
                  backdropFilter: "blur(12px)",
                  fontFamily: "var(--font-condensed)", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
                  textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s ease",
                }}
                onMouseEnter={e => { if (filter !== f) { e.currentTarget.style.background = "rgba(40,40,40,0.6)"; e.currentTarget.style.color = "#fff"; } }}
                onMouseLeave={e => { if (filter !== f) { e.currentTarget.style.background = "rgba(25,25,25,0.4)"; e.currentTarget.style.color = "#999"; } }}
                >
                  {f === "all" ? `All (${alerts.length})` : `${f} (${alerts.filter(a => a.severity === f).length})`}
                </button>
              ))}
            </div>

            {/* Alert Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map(alert => {
                const cfg = SEV_CONFIG[alert.severity];
                return (
                  <div key={alert.id} className="glass-card" style={{
                    background: `linear-gradient(90deg, ${cfg.bg} 0%, rgba(20,20,20,0.5) 100%)`,
                    border: `1px solid rgba(255,255,255,0.05)`,
                    padding: "24px",
                    transition: "all 0.3s cubic-bezier(0.25, 0, 0.1, 1)",
                    borderLeft: `4px solid ${cfg.color}`,
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateX(6px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${cfg.bg.replace("0.08", "0.15")}`; e.currentTarget.style.borderColor = `rgba(255,255,255,0.15)`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.2)"; e.currentTarget.style.borderColor = `rgba(255,255,255,0.05)`; }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                      <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{cfg.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: "var(--font-condensed)", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: cfg.color, padding: "3px 8px", border: `1px solid ${cfg.color}` }}>
                            {cfg.label}
                          </span>
                          <span style={{ fontFamily: "var(--font-condensed)", fontSize: 10, color: "#555" }}>{alert.mode} · {alert.location}</span>
                          {alert.active && (
                            <span style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, animation: "live-pulse 1.4s ease-in-out infinite" }} />
                              <span style={{ fontFamily: "var(--font-condensed)", fontSize: 9, color: cfg.color, letterSpacing: "0.1em" }}>LIVE</span>
                            </span>
                          )}
                        </div>
                        <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{alert.title}</div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#888", lineHeight: 1.6, marginBottom: 12 }}>{alert.desc}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", marginTop: 4 }}>
                          {/* Crowd meter */}
                          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 160 }}>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#777", flexShrink: 0 }}>CROWD</span>
                            <div style={{ flex: 1, height: 6, background: "rgba(0,0,0,0.4)", borderRadius: 3, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
                              <div style={{ height: "100%", width: `${alert.crowd}%`, background: cfg.color, transition: "width 1s cubic-bezier(0.25, 0, 0.1, 1)", borderRadius: 3, boxShadow: `0 0 8px ${cfg.color}` }} />
                            </div>
                            <span style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 800, color: cfg.color, flexShrink: 0 }}>{alert.crowd}%</span>
                          </div>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#555" }}>{alert.time}</span>
                          <Link href="/commuter" style={{ fontFamily: "var(--font-condensed)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-accent)", textDecoration: "none", textTransform: "uppercase" }}>
                            Get Alternative →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SIDEBAR */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Report Crowd */}
            <div className="glass-panel" style={{ padding: "24px" }}>
              <div style={{ fontFamily: "var(--font-condensed)", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#888", marginBottom: 6 }}>— Report Crowd</div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 20 }}>Submit Live Ground Truth</div>
              <textarea
                value={userReport}
                onChange={e => setUserReport(e.target.value)}
                placeholder="e.g. Massive crowd at Borivali platform 4, trains delayed..."
                style={{ width: "100%", height: "90px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "14px", color: "#fff", fontFamily: "var(--font-body)", fontSize: 14, marginBottom: 16, outline: "none", boxSizing: "border-box", resize: "none", transition: "border 0.2s" }}
                onFocus={e => (e.target.style.borderColor = "var(--color-accent)")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
              {submitted ? (
                <div style={{ padding: "14px 16px", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, fontFamily: "var(--font-condensed)", fontSize: 13, color: "#22C55E", letterSpacing: "0.08em", textAlign: "center", fontWeight: 700 }}>
                  ✓ Report analyzed & submitted
                </div>
              ) : (
                <button onClick={handleReport} disabled={!userReport} style={{ width: "100%", padding: "14px", background: userReport ? "var(--color-accent)" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, color: userReport ? "#000" : "#666", fontFamily: "var(--font-condensed)", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: userReport ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
                  Analyze & Submit →
                </button>
              )}
            </div>

            {/* Alert Stats */}
            <div className="glass-panel" style={{ padding: "24px" }}>
              <div style={{ fontFamily: "var(--font-condensed)", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#888", marginBottom: 16 }}>— System Status</div>
              {[
                { label: "AI Agent", value: "Running", color: "#22C55E" },
                { label: "Alert Engine", value: "Active", color: "#22C55E" },
                { label: "Data Feed", value: "Live · 60s cycle", color: "#60A5FA" },
                { label: "HITL Reports", value: "3 pending review", color: "#FDE047" },
                { label: "Zones Monitored", value: "47 / 47", color: "#ccc" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontFamily: "var(--font-condensed)", fontSize: 12, color: "#aaa", letterSpacing: "0.06em" }}>{s.label}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Quick Nav */}
            <div className="glass-panel" style={{ padding: "24px" }}>
              <div style={{ fontFamily: "var(--font-condensed)", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#888", marginBottom: 16 }}>— Navigate</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Predict My Commute", href: "/commuter" },
                  { label: "View Crowd Analytics", href: "/analytics" },
                  { label: "Live Dashboard", href: "/dashboard" },
                  { label: "Open Map View", href: "/map" },
                ].map(n => (
                  <Link key={n.label} href={n.href} style={{ display: "block", padding: "12px 16px", background: "rgba(0,0,0,0.3)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.03)", fontFamily: "var(--font-condensed)", fontSize: 12, color: "#aaa", textDecoration: "none", letterSpacing: "0.06em", transition: "all 0.2s ease" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(40,40,40,0.6)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.3)"; e.currentTarget.style.color = "#aaa"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.03)"; }}
                  >{n.label} →</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer style={{ borderTop: "1px solid #1a1a1a", padding: "24px clamp(20px,5vw,64px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#444" }}>© 2026 CrowdSense Mumbai — Team Technexis</span>
        <div style={{ display: "flex", gap: 24 }}>
          {["Home","Dashboard","Commuter","Analytics"].map(l => (
            <Link key={l} href={l === "Home" ? "/" : `/${l.toLowerCase()}`} style={{ fontFamily: "var(--font-condensed)", fontSize: 11, color: "#444", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-accent)")}
              onMouseLeave={e => (e.currentTarget.style.color = "#444")}>{l}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
