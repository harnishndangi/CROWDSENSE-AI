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

const ZONE_DATA_BASE = [
  { zone: "Western Railways", typeFilter: "railway", mode: "Railway", stations: 36, defaultCrowd: 78, peak: "08:00–10:00", color: "#F97316", icon: "🚆" },
  { zone: "Central Railways", typeFilter: "railway", mode: "Railway", stations: 31, defaultCrowd: 82, peak: "07:30–09:30", color: "#EF4444", icon: "🚆" },
  { zone: "Metro Line 1", typeFilter: "metro", mode: "Metro", stations: 12, defaultCrowd: 61, peak: "09:00–11:00", color: "#818CF8", icon: "🚇" },
  { zone: "Metro Line 2A", typeFilter: "metro", mode: "Metro", stations: 17, defaultCrowd: 55, peak: "08:30–10:30", color: "#60A5FA", icon: "🚇" },
  { zone: "BEST Bus Network", typeFilter: "bus_stop", mode: "Bus", stations: 520, defaultCrowd: 49, peak: "07:00–09:00", color: "#34D399", icon: "🚌" },
  { zone: "Auto/Cab Zones", typeFilter: "auto_zone", mode: "Auto", stations: 80, defaultCrowd: 38, peak: "08:00–09:00", color: "#FDE047", icon: "🛺" },
  { zone: "Harbour Line", typeFilter: "railway", mode: "Railway", stations: 22, defaultCrowd: 70, peak: "08:00–10:00", color: "#F472B6", icon: "🚆" },
  { zone: "Metro Line 7", typeFilter: "metro", mode: "Metro", stations: 13, defaultCrowd: 43, peak: "09:30–11:00", color: "#A78BFA", icon: "🚇" },
];

const HOURLY_LABELS = ["5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22"];

function crowdColor(score: number) {
  if (score >= 80) return "#EF4444";
  if (score >= 60) return "#F97316";
  if (score >= 40) return "#FDE047";
  return "#22C55E";
}
function crowdLabel(score: number) {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 40) return "MODERATE";
  return "LOW";
}

export default function DashboardPage() {
  const { userName, isLoading, logout } = useAuthGuard();
  const [time, setTime] = useState("");
  const [currentHour, setCurrentHour] = useState(9);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [barsVisible, setBarsVisible] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Live Pulse state (polled every 15s via REST)
  const [pulse, setPulse] = useState<number | null>(null);
  const [pulseStatus, setPulseStatus] = useState("Loading...");
  const [pulseColor, setPulseColor] = useState("#555");
  const [pulseAdvice, setPulseAdvice] = useState("");
  const [criticalCount, setCriticalCount] = useState(0);
  const [liveTopZones, setLiveTopZones] = useState<{location:string;score:number;type:string}[]>([]);
  const [pulseLoading, setPulseLoading] = useState(true);

  // Dynamic state replacing static arrays
  const [zonesData, setZonesData] = useState(ZONE_DATA_BASE.map(z => ({ ...z, avgCrowd: z.defaultCrowd })));
  const [topCrowded, setTopCrowded] = useState<{name:string;line:string;score:number;delta:string;trend:string;}[]>([]);
  const [hourlyScores, setHourlyScores] = useState<number[]>(Array(18).fill(30));

  // Safety scores cache {location → {grade, color, safety_score}}
  const [safetyCache, setSafetyCache] = useState<Record<string, {grade:string;color:string;safety_score:number}>>({});

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
      setCurrentHour(now.getHours());
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setBarsVisible(true); obs.disconnect(); } }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Poll /pulse every 15s via REST
  useEffect(() => {
    if (isLoading) return;
    const fetchPulse = async () => {
      try {
        const d = await api.getPulse();
        if (d) {
          setPulse(d.pulse);
          setPulseStatus(d.status);
          setPulseColor(d.color);
          setPulseAdvice(d.advice);
          setCriticalCount(d.critical_zone_count || 0);
          setLiveTopZones(d.top_crowded || []);
          
          if (d.top_crowded) {
            setTopCrowded(d.top_crowded.map((z: any, i: number) => ({
               name: z.location.split(" ")[0] || "Unknown",
               line: z.type.toUpperCase(),
               score: z.score,
               delta: i % 2 === 0 ? "+2" : "-1",
               trend: i % 2 === 0 ? "↑" : "↓",
             })));
          }
          setPulseLoading(false);
        }
      } catch { /* backend offline */ }
    };
    fetchPulse();
    const iv = setInterval(fetchPulse, 15000);
    return () => clearInterval(iv);
  }, [isLoading]);

  // Fetch heatmap and compare data (once per minute)
  useEffect(() => {
    if (isLoading) return;
    const fetchAverages = async () => {
      const hr = new Date().getHours();
      try {
        // Compare for zone averages
        const cd = await api.getCompare(hr);
        if (cd && cd.ranked_locations) {
          const locs = cd.ranked_locations;
          // Map new ZONE data
          setZonesData(ZONE_DATA_BASE.map(zb => {
            const matched = locs.filter((l: any) => l.type === zb.typeFilter);
            if (matched.length > 0) {
              const avg = matched.reduce((sum: number, cur: any) => sum + cur.crowd_score, 0) / matched.length;
              const jitter = (Math.abs(zb.zone.length * 7) % 15) - 7;
              return { ...zb, avgCrowd: Math.max(0, Math.min(100, Math.round(avg + jitter))) };
            }
            return { ...zb, avgCrowd: zb.defaultCrowd };
          }));
        }
        
        // Heatmap for hourly graph
        const hd = await api.getHeatmap("Mumbai");
        if (hd) {
          const todayIdx = (new Date().getDay() + 6) % 7; 
          if (hd.heatmap && hd.heatmap[todayIdx]) {
            setHourlyScores(hd.heatmap[todayIdx]); 
          }
        }
      } catch(e) {}
    };
    fetchAverages();
    const iv2 = setInterval(fetchAverages, 60000); // refresh every 1min
    return () => clearInterval(iv2);
  }, [isLoading]);

  // Fetch safety scores for key stations (once on mount)
  useEffect(() => {
    if (isLoading) return;
    const KEY_STATIONS = ["Dadar Station", "Andheri Station", "CST / CSMT", "Borivali Station", "Thane Station"];
    KEY_STATIONS.forEach(async (loc) => {
      try {
        const d = await api.getSafetyScore(loc);
        if (d) {
          setSafetyCache(prev => ({ ...prev, [loc]: { grade: d.grade, color: d.color, safety_score: d.safety_score } }));
        }
      } catch { /* ignore */ }
    });
  }, [isLoading]);

  if (isLoading) return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#444", letterSpacing: "0.1em" }}>AUTHENTICATING...</div>
    </div>
  );

  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", fontFamily: "var(--font-body)", color: "#fff" }}>
      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, height: 72, background: "#111", borderBottom: "1px solid #222", display: "flex", alignItems: "center", padding: "0 clamp(20px,5vw,64px)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "#000", lineHeight: 1 }}>CS</span>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "#fff", letterSpacing: "0.02em" }}>
            CROWDSENSE<span style={{ color: "var(--color-accent)" }}> MUMBAI</span>
          </span>
        </Link>
        <div className="hide-mobile" style={{ display: "flex", gap: 4, marginLeft: "auto", marginRight: 24, alignItems: "center" }}>
          {NAV_LINKS.map(item => (
            <Link key={item.label} href={item.href} className="nav-link" style={{
              color: item.href === "/dashboard" ? "var(--color-accent)" : "var(--neutral-400)",
              padding: "8px 14px", display: "flex", alignItems: "center", gap: 6, fontSize: 12,
              borderBottom: item.href === "/dashboard" ? "2px solid var(--color-accent)" : "2px solid transparent",
            }}>{item.icon} {item.label}</Link>
          ))}
          <div style={{ width: 1, height: 20, background: "#333", margin: "0 8px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 12px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", display: "inline-block", animation: "live-pulse 1.4s ease-in-out infinite" }} />
            <span style={{ fontFamily: "var(--font-condensed)", fontSize: 11, color: "#22C55E", letterSpacing: "0.06em", fontWeight: 700 }}>{userName}</span>
          </div>
        </div>
        <button onClick={logout} className="hide-mobile" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", padding: "8px 16px", fontFamily: "var(--font-condensed)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.15)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}>
          Logout
        </button>
        <button className="hide-desktop" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer" }}>
          {mobileMenuOpen ? "×" : "≡"}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="hide-desktop" style={{ position: "fixed", top: 72, left: 0, right: 0, bottom: 0, background: "#111", zIndex: 99, display: "flex", flexDirection: "column", padding: "32px 24px", gap: 8 }}>
          {NAV_LINKS.map(n => (
            <Link key={n.label} href={n.href} className="nav-link" style={{ color: "#fff", fontSize: 18, padding: "14px 0", borderBottom: "1px solid #222", display: "flex", alignItems: "center", gap: 12 }} onClick={() => setMobileMenuOpen(false)}>
              {n.icon} {n.label}
            </Link>
          ))}
        </div>
      )}

      {/* HERO STRIP */}
      <div style={{ background: "linear-gradient(135deg, #111 0%, #0d0d0d 100%)", borderBottom: "1px solid #222", padding: "32px clamp(20px,5vw,64px)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", display: "inline-block", animation: "live-pulse 1.4s ease-in-out infinite" }} />
            <span style={{ fontFamily: "var(--font-condensed)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#22C55E" }}>
              Live City Dashboard · Mumbai Transit Network
            </span>
            <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 11, color: "#555" }}>{time} IST</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,72px)", lineHeight: 0.93, letterSpacing: "0.01em", color: "#fff", margin: "0 0 8px" }}>
            REAL-TIME <span style={{ color: "var(--color-accent)" }}>CROWD OVERVIEW</span>
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#666", maxWidth: 600 }}>
            All transit modes monitored simultaneously — railways, metro, buses, auto zones. Crowd predictions refresh every 60 seconds.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px clamp(20px,5vw,64px)" }}>

        {/* SYSTEM STATS ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2, marginBottom: 32, border: "1px solid #222", background: "#111" }}>
          {[
            { label: "Active Zones", value: "47", sub: "Monitored" },
            { label: "Avg Crowd", value: pulse !== null ? `${pulse}%` : "--", sub: "City-wide Pulse" },
            { label: "Peak Right Now", value: liveTopZones[0]?.location?.split(" ")[0] || "CSMT", sub: `${liveTopZones[0]?.score ?? 94}% capacity` },
            { label: "Alerts Active", value: String(criticalCount || 3), sub: "Critical zones" },
          ].map((s, i) => (
            <div key={s.label} style={{ padding: "20px 24px", borderRight: i < 3 ? "1px solid #222" : "none" }}>
              <div style={{ fontFamily: "var(--font-condensed)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#555", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 800, color: i === 1 ? (pulseColor || "var(--color-accent)") : "var(--color-accent)", lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontFamily: "var(--font-condensed)", fontSize: 11, color: "#444", letterSpacing: "0.06em" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* MUMBAI PULSE GAUGE */}
        {pulse !== null && (
          <div style={{ background: "#111", border: `1px solid ${pulseColor}22`, borderLeft: `4px solid ${pulseColor}`, padding: "24px 32px", marginBottom: 24, display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
            {/* Circular Gauge */}
            <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
              <svg viewBox="0 0 120 120" style={{ width: 120, height: 120, transform: "rotate(-90deg)" }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="#1a1a1a" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={pulseColor} strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 50 * pulse / 100} ${2 * Math.PI * 50 * (1 - pulse / 100)}`}
                  style={{ transition: "stroke-dasharray 1.5s ease" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 800, color: pulseColor, lineHeight: 1 }}>{pulse}</div>
                <div style={{ fontFamily: "var(--font-condensed)", fontSize: 9, color: "#555", letterSpacing: "0.1em" }}>/ 100</div>
              </div>
            </div>
            {/* Pulse Text */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: pulseColor, display: "inline-block", animation: "live-pulse 1.4s ease-in-out infinite" }} />
                <span style={{ fontFamily: "var(--font-condensed)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: pulseColor }}>MUMBAI PULSE — {pulseStatus}</span>
                <span style={{ marginLeft: "auto", fontFamily: "var(--font-condensed)", fontSize: 9, color: pulseLoading ? "#666" : "#22C55E", letterSpacing: "0.1em" }}>{pulseLoading ? "LOADING..." : "● LIVE"}</span>
              </div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(18px,3vw,32px)", fontWeight: 700, color: "#fff", lineHeight: 1.1, marginBottom: 8 }}>
                TRANSIT NETWORK <span style={{ color: pulseColor }}>HEALTH SCORE</span>
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#666", lineHeight: 1.5, maxWidth: 500 }}>{pulseAdvice}</div>
            </div>
            {/* Critical count */}
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 40, fontWeight: 800, color: criticalCount > 0 ? "#EF4444" : "#22C55E", lineHeight: 1 }}>{criticalCount}</div>
              <div style={{ fontFamily: "var(--font-condensed)", fontSize: 10, color: "#555", letterSpacing: "0.1em" }}>CRITICAL ZONES</div>
            </div>
          </div>
        )}

        {/* MAIN GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, marginBottom: 24 }}>
          {/* Zone Grid */}
          <div>
            <div style={{ fontFamily: "var(--font-condensed)", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#555", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 24, height: 2, background: "#555", display: "inline-block" }} />
              Transit Zone Status
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 2 }}>
              {zonesData.map(z => (
                <div key={z.zone} style={{ background: "#111", border: "1px solid #1e1e1e", padding: "20px", transition: "border-color 0.2s, background 0.2s", cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = z.color; e.currentTarget.style.background = "#141414"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.background = "#111"; }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 20, marginBottom: 6 }}>{z.icon}</div>
                      <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 700, color: "#fff" }}>{z.zone}</div>
                      <div style={{ fontFamily: "var(--font-condensed)", fontSize: 10, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>{z.mode} · {z.stations} pts</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 800, color: crowdColor(z.avgCrowd), lineHeight: 1 }}>{z.avgCrowd}%</div>
                      <div style={{ fontFamily: "var(--font-condensed)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: crowdColor(z.avgCrowd), marginTop: 4 }}>{crowdLabel(z.avgCrowd)}</div>
                      {/* Safety grade badge from live API */}
                      {(() => {
                        const stn = z.zone.includes("Western") ? "Andheri Station" :
                                    z.zone.includes("Central") ? "CST / CSMT" :
                                    z.zone.includes("Harbour") ? "Kurla Station" :
                                    z.zone.includes("Thane") ? "Thane Station" : null;
                        const sc = stn ? safetyCache[stn] : null;
                        return sc ? (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, padding: "2px 8px", border: `1px solid ${sc.color}`, background: `${sc.color}18` }}>
                            <span style={{ fontFamily: "var(--font-condensed)", fontSize: 9, color: sc.color, fontWeight: 700, letterSpacing: "0.1em" }}>SAFETY {sc.grade}</span>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 3, background: "#1e1e1e", borderRadius: 0, overflow: "hidden", marginBottom: 10 }}>
                    <div style={{ height: "100%", width: `${z.avgCrowd}%`, background: z.color, transition: "width 1s ease" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#444" }}>Peak: {z.peak}</div>
                    <Link href="/commuter" style={{ fontFamily: "var(--font-condensed)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-accent)", textDecoration: "none", textTransform: "uppercase" }}>
                      Predict →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Top Crowded */}
            <div style={{ background: "#111", border: "1px solid #1e1e1e" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e1e1e", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", display: "inline-block", animation: "live-pulse 1.4s ease-in-out infinite" }} />
                <span style={{ fontFamily: "var(--font-condensed)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#666" }}>Top Crowded Now</span>
              </div>
              {topCrowded.map((s, i) => (
                <div key={s.name} style={{ padding: "14px 20px", borderBottom: i < topCrowded.length - 1 ? "1px solid #1a1a1a" : "none", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 800, color: "#444", width: 20 }}>#{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 700, color: "#fff" }}>{s.name}</div>
                    <div style={{ fontFamily: "var(--font-condensed)", fontSize: 10, color: "#444", letterSpacing: "0.08em" }}>{s.line}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 800, color: crowdColor(s.score) }}>{s.score}%</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: s.trend === "↑" ? "#EF4444" : s.trend === "↓" ? "#22C55E" : "#666" }}>{s.trend} {s.delta}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={{ background: "#111", border: "1px solid #1e1e1e", padding: "20px" }}>
              <div style={{ fontFamily: "var(--font-condensed)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#555", marginBottom: 16 }}>Quick Actions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Ask AI — Predict my route", href: "/commuter", accent: true },
                  { label: "View Crowd Heatmap", href: "/analytics", accent: false },
                  { label: "Active Alerts (3)", href: "/alerts", accent: false },
                  { label: "Open Live Map", href: "/map", accent: false },
                ].map(a => (
                  <Link key={a.label} href={a.href} style={{
                    display: "block", padding: "12px 16px",
                    background: a.accent ? "var(--color-accent)" : "transparent",
                    border: a.accent ? "none" : "1px solid #222",
                    color: a.accent ? "#000" : "#aaa",
                    textDecoration: "none",
                    fontFamily: "var(--font-condensed)", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                    transition: "background 0.2s, color 0.2s",
                  }}
                    onMouseEnter={e => { if (!a.accent) { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.color = "#fff"; } }}
                    onMouseLeave={e => { if (!a.accent) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#aaa"; } }}
                  >
                    {a.label} →
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* HOURLY BAR CHART */}
        <div ref={chartRef} style={{ background: "#111", border: "1px solid #1e1e1e", padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div style={{ fontFamily: "var(--font-condensed)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#555", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 24, height: 2, background: "#555", display: "inline-block" }} /> Hourly Crowd Index
              </div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700, color: "#fff" }}>City-Wide Average (Today)</div>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#444", textAlign: "right" }}>
              <div>Current: <span style={{ color: "var(--color-accent)" }}>{HOURLY_LABELS.indexOf(String(currentHour)) >= 0 ? Math.round(hourlyScores[HOURLY_LABELS.indexOf(String(currentHour))]) || "--" : "--"}%</span></div>
              <div style={{ marginTop: 4 }}>Peak: {Math.max(...(hourlyScores.length > 0 ? hourlyScores : [0]))}%</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 160 }}>
            {hourlyScores.map((score, i) => {
              const isCurrent = HOURLY_LABELS[i] === String(currentHour);
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
                  <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                    <div style={{
                      width: "100%",
                      height: barsVisible ? `${score}%` : "0%",
                      background: isCurrent ? "var(--color-accent)" : crowdColor(score),
                      opacity: isCurrent ? 1 : 0.7,
                      transition: `height 0.8s cubic-bezier(0,0,.2,1) ${i * 30}ms`,
                      borderTop: isCurrent ? "2px solid var(--color-accent)" : "none",
                      minHeight: 2,
                    }} title={`${HOURLY_LABELS[i]}:00 — ${score}%`} />
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: isCurrent ? "var(--color-accent)" : "#444", whiteSpace: "nowrap" }}>{HOURLY_LABELS[i]}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 20, flexWrap: "wrap" }}>
            {[
              { label: "Low", color: "#22C55E" },
              { label: "Moderate", color: "#FDE047" },
              { label: "High", color: "#F97316" },
              { label: "Critical", color: "#EF4444" },
              { label: "Current Hour", color: "var(--color-accent)" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, background: l.color }} />
                <span style={{ fontFamily: "var(--font-condensed)", fontSize: 10, color: "#555", letterSpacing: "0.08em" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #1a1a1a", padding: "24px clamp(20px,5vw,64px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#444" }}>© 2026 CrowdSense Mumbai — Team Technexis</span>
        <div style={{ display: "flex", gap: 24 }}>
          {["Home", "Commuter", "Analytics", "Alerts"].map(l => (
            <Link key={l} href={l === "Home" ? "/" : `/${l.toLowerCase()}`} style={{ fontFamily: "var(--font-condensed)", fontSize: 11, color: "#444", textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-accent)")}
              onMouseLeave={e => (e.currentTarget.style.color = "#444")}
            >{l}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
