"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuthGuard } from "../lib/useAuthGuard";
import { api } from "../lib/api";


const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: "⬡" },
  { label: "Commuter", href: "/commuter", icon: "🚆" },
  { label: "Analytics", href: "/analytics", icon: "📊" },
  { label: "Alerts", href: "/alerts", icon: "🔔" },
  { label: "Map", href: "/map", icon: "🗺" },
];

const HOURS_AXIS = ["5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function generateHeatmap(): number[][] {
  return DAYS.map((_, d) =>
    HOURS_AXIS.map((_, i) => {
      const hr = 5 + i;
      const isWeekday = d < 5;
      const base = isWeekday ? 35 : 28;
      const amPeak = isWeekday ? 38 * Math.exp(-0.5 * ((hr - 8.5) / 1.2) ** 2) : 15 * Math.exp(-0.5 * ((hr - 11) / 2) ** 2);
      const pmPeak = isWeekday ? 38 * Math.exp(-0.5 * ((hr - 18.5) / 1.5) ** 2) : 22 * Math.exp(-0.5 * ((hr - 17) / 2) ** 2);
      const jitter = Math.round(Math.sin(d * 7 + hr * 3) * 6);
      return Math.max(2, Math.min(100, Math.round(base + amPeak + pmPeak + jitter)));
    })
  );
}

function heatColor(s: number) {
  if (s >= 80) return "#7f1d1d";
  if (s >= 65) return "#991b1b";
  if (s >= 50) return "#b45309";
  if (s >= 35) return "#78350f";
  if (s >= 20) return "#14532d";
  return "#052e16";
}

const MODES = [
  { mode: "Local Railways", share: 42, load: 81, color: "#EF4444", icon: "🚆" },
  { mode: "BEST Bus", share: 28, load: 49, color: "#34D399", icon: "🚌" },
  { mode: "Metro", share: 16, load: 58, color: "#818CF8", icon: "🚇" },
  { mode: "Auto / Cab", share: 9, load: 38, color: "#FDE047", icon: "🛺" },
  { mode: "Ferry", share: 5, load: 22, color: "#60A5FA", icon: "⛵" },
];

const WEEKLY = [
  { day: "Mon", peak: 92, avg: 61 },
  { day: "Tue", peak: 90, avg: 59 },
  { day: "Wed", peak: 94, avg: 63 },
  { day: "Thu", peak: 89, avg: 58 },
  { day: "Fri", peak: 96, avg: 66 },
  { day: "Sat", peak: 74, avg: 48 },
  { day: "Sun", peak: 62, avg: 40 },
];

const INSIGHTS = [
  { icon: "📈", title: "Friday Peak Surge", value: "+48%", desc: "Friday 18:00–20:00 sees the highest city-wide crowd — 48% above Monday baseline." },
  { icon: "🌊", title: "Monsoon Impact", value: "+23%", desc: "Crowd density on rainy days increases by 23% at covered transit hubs." },
  { icon: "⏱", title: "Best Window", value: "11–14h", desc: "Mid-day weekdays consistently show the lowest-crowd transit period across zones." },
  { icon: "🚆", title: "Railway Dominance", value: "42% share", desc: "Local railways carry 42% of all daily commuters — the critical crowd-management target." },
];

const LOCS = ["Dadar", "Andheri", "CSMT", "Borivali", "Thane"];

export default function AnalyticsPage() {
  const { userName, isLoading: authLoading, logout } = useAuthGuard();
  const [loc, setLoc] = useState("Dadar");
  const [hm, setHm] = useState<number[][]>(generateHeatmap());
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [time, setTime] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setTime(n.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const changeLoc = async (l: string) => {
    setLoc(l); setLoading(true);
    try {
      const j = await api.getHeatmap(l);
      if (j && j.heatmap) setHm(j.heatmap);
    } catch { setHm(generateHeatmap()); }
    finally { setLoading(false); }
  };

  if (authLoading) return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#444", letterSpacing: "0.1em" }}>AUTHENTICATING...</div>
    </div>
  );

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", fontFamily: "var(--font-body)", color: "#fff" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 100, height: 72, background: "#111", borderBottom: "1px solid #222", display: "flex", alignItems: "center", padding: "0 clamp(20px,5vw,64px)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "#000" }}>CS</span>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "#fff", letterSpacing: "0.02em" }}>CROWDSENSE<span style={{ color: "var(--color-accent)" }}> MUMBAI</span></span>
        </Link>
        <div className="hide-mobile" style={{ display: "flex", gap: 4, marginLeft: "auto", marginRight: 24, alignItems: "center" }}>
          {NAV_LINKS.map(n => (
            <Link key={n.label} href={n.href} className="nav-link" style={{ color: n.href === "/analytics" ? "var(--color-accent)" : "#666", padding: "8px 14px", display: "flex", alignItems: "center", gap: 6, fontSize: 12, borderBottom: n.href === "/analytics" ? "2px solid var(--color-accent)" : "2px solid transparent" }}>{n.icon} {n.label}</Link>
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

      <div style={{ background: "#111", borderBottom: "1px solid #222", padding: "32px clamp(20px,5vw,64px)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--font-condensed)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#555", marginBottom: 8 }}>Analytics &amp; Distribution · {time} IST</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,72px)", lineHeight: 0.93, color: "#fff", margin: "0 0 8px" }}>CROWD <span style={{ color: "var(--color-accent)" }}>ANALYTICS</span></h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#666", maxWidth: 600 }}>Temporal distributions, weekly heatmaps, modal split analysis, and predictive insight across all monitored zones.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px clamp(20px,5vw,64px)" }}>

        {/* HEATMAP */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontFamily: "var(--font-condensed)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#555", marginBottom: 4 }}>— Weekly Crowd Heatmap</div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700, color: "#fff" }}>7-Day × 18-Hour Distribution</div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {LOCS.map(l => (
                <button key={l} onClick={() => changeLoc(l)} style={{ padding: "8px 16px", background: loc === l ? "var(--color-accent)" : "transparent", border: `1px solid ${loc === l ? "var(--color-accent)" : "#333"}`, color: loc === l ? "#000" : "#666", fontFamily: "var(--font-condensed)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ background: "#111", border: "1px solid #1e1e1e", padding: "24px", overflowX: "auto" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0", fontFamily: "var(--font-mono)", fontSize: 12, color: "#555" }}>Loading heatmap...</div>
            ) : (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: `72px repeat(${HOURS_AXIS.length}, 1fr)`, gap: 2, marginBottom: 2 }}>
                  <div />
                  {HOURS_AXIS.map(h => <div key={h} style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#444", textAlign: "center" }}>{h}</div>)}
                </div>
                {DAYS.map((day, di) => (
                  <div key={day} style={{ display: "grid", gridTemplateColumns: `72px repeat(${HOURS_AXIS.length}, 1fr)`, gap: 2, marginBottom: 2 }}>
                    <div style={{ fontFamily: "var(--font-condensed)", fontSize: 11, color: "#555", display: "flex", alignItems: "center", fontWeight: 700 }}>{day}</div>
                    {(hm[di] || []).map((sc, hi) => (
                      <div key={hi} title={`${day} ${HOURS_AXIS[hi]}:00 → ${sc}%`}
                        style={{ height: 30, background: heatColor(sc), cursor: "default", transition: "opacity 0.15s" }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = "0.6")}
                        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                      />
                    ))}
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 14 }}>
                  <span style={{ fontFamily: "var(--font-condensed)", fontSize: 10, color: "#444", marginRight: 6 }}>LOW</span>
                  {["#052e16", "#14532d", "#78350f", "#b45309", "#991b1b", "#7f1d1d"].map(c => <div key={c} style={{ width: 22, height: 12, background: c }} />)}
                  <span style={{ fontFamily: "var(--font-condensed)", fontSize: 10, color: "#444", marginLeft: 6 }}>HIGH</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* WEEKLY + MODAL SPLIT */}
        <div ref={ref} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24, marginBottom: 40 }}>
          <div style={{ background: "#111", border: "1px solid #1e1e1e", padding: "24px" }}>
            <div style={{ fontFamily: "var(--font-condensed)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#555", marginBottom: 4 }}>— Weekly Peak vs Avg</div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 20 }}>Day-of-Week Pattern</div>
            {WEEKLY.map((d, i) => (
              <div key={d.day} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontFamily: "var(--font-condensed)", fontSize: 11, color: "#666", fontWeight: 700 }}>{d.day}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#444" }}>avg {d.avg}% · peak {d.peak}%</span>
                </div>
                <div style={{ height: 5, background: "#1a1a1a", overflow: "hidden", marginBottom: 2 }}>
                  <div style={{ height: "100%", width: visible ? `${d.avg}%` : "0%", background: "#22C55E", opacity: 0.6, transition: `width 0.9s ease ${i * 60}ms` }} />
                </div>
                <div style={{ height: 5, background: "#1a1a1a", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: visible ? `${d.peak}%` : "0%", background: d.peak >= 90 ? "#EF4444" : "#F97316", transition: `width 0.9s ease ${i * 60 + 150}ms` }} />
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 12, height: 5, background: "#22C55E", opacity: 0.6 }} /><span style={{ fontFamily: "var(--font-condensed)", fontSize: 10, color: "#444" }}>Average</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 12, height: 5, background: "#EF4444" }} /><span style={{ fontFamily: "var(--font-condensed)", fontSize: 10, color: "#444" }}>Peak</span></div>
            </div>
          </div>

          <div style={{ background: "#111", border: "1px solid #1e1e1e", padding: "24px" }}>
            <div style={{ fontFamily: "var(--font-condensed)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#555", marginBottom: 4 }}>— Modal Split</div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 20 }}>Commuter Mode Distribution</div>
            <div style={{ display: "flex", height: 24, overflow: "hidden", marginBottom: 20 }}>
              {MODES.map(m => <div key={m.mode} title={`${m.mode}: ${m.share}%`} style={{ width: `${m.share}%`, background: m.color }} />)}
            </div>
            {MODES.map((m, i) => (
              <div key={m.mode} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 18 }}>{m.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: "var(--font-condensed)", fontSize: 12, color: "#aaa", fontWeight: 700 }}>{m.mode}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#555" }}>{m.share}% · {m.load}% load</span>
                  </div>
                  <div style={{ height: 4, background: "#1a1a1a", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: visible ? `${m.load}%` : "0%", background: m.color, transition: `width 0.9s ease ${i * 80}ms` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INSIGHTS */}
        <div style={{ background: "#111", border: "1px solid #1e1e1e", padding: "28px", marginBottom: 24 }}>
          <div style={{ fontFamily: "var(--font-condensed)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#555", marginBottom: 4 }}>— AI-Generated Insights</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 20 }}>Key Analytical Findings</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 2 }}>
            {INSIGHTS.map(ins => (
              <div key={ins.title} style={{ padding: "20px", borderLeft: "3px solid #222" }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{ins.icon}</div>
                <div style={{ fontFamily: "var(--font-condensed)", fontSize: 10, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{ins.title}</div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 800, color: "var(--color-accent)", marginBottom: 8 }}>{ins.value}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#555", lineHeight: 1.6 }}>{ins.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "28px", background: "#111", border: "1px solid #1e1e1e", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Want AI crowd predictions for your route?</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#555" }}>Use the Commuter AI to get personalised forecasts and travel alternatives.</div>
          </div>
          <Link href="/commuter" className="btn-accent" style={{ padding: "14px 28px", whiteSpace: "nowrap" }}>Ask the AI Agent →</Link>
        </div>
      </div>

      <footer style={{ borderTop: "1px solid #1a1a1a", padding: "24px clamp(20px,5vw,64px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#444" }}>© 2026 CrowdSense Mumbai — Team Technexis</span>
        <div style={{ display: "flex", gap: 24 }}>
          {["Home", "Dashboard", "Commuter", "Alerts"].map(l => (
            <Link key={l} href={l === "Home" ? "/" : `/${l.toLowerCase()}`} style={{ fontFamily: "var(--font-condensed)", fontSize: 11, color: "#444", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-accent)")}
              onMouseLeave={e => (e.currentTarget.style.color = "#444")}>{l}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
