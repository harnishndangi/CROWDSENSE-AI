"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "./lib/supabaseClient";
import { api } from "./lib/api";

/* ─── Data ─────────────────────────────────────── */
const TICKER_ALERTS_FALLBACK = [
  "VERY HIGH — Dadar Station · 847 pax on platform 3",
  "MEDIUM — Andheri Metro · 320 pax · Wait 4 min",
  "LOW — CST Terminus · 112 pax · All clear",
  "AI ALERT — Agent predicts WEH congestion by 18:30",
  "MONSOON — Scattered showers Andheri / Borivali",
];

const LIVE_STATIONS_FALLBACK = [
  { name: "CSMT Terminus", line: "CR", lineColor: "#EF4444", crowd: "very-high", count: 847, platform: "3" },
  { name: "Dadar", line: "WR", lineColor: "#F97316", crowd: "high", count: 612, platform: "2" },
  { name: "Andheri", line: "Metro L1", lineColor: "#60A5FA", crowd: "medium", count: 308, platform: "1" },
  { name: "Bandra Terminus", line: "WR", lineColor: "#F97316", crowd: "low", count: 145, platform: "4" },
  { name: "Kurla", line: "Harbour", lineColor: "#FDE047", crowd: "medium", count: 420, platform: "2" },
];

const FEATURE_BARS_FALLBACK = [
  { label: "Hour of Day", pct: 85 },
  { label: "Weather Signal", pct: 72 },
  { label: "Tide Impact", pct: 40 },
  { label: "Social Buzz", pct: 68 },
  { label: "Event Override", pct: 30 },
];

const crowdMeta: Record<string, { label: string; color: string }> = {
  "low": { label: "LOW", color: "#22C55E" },
  "medium": { label: "MED", color: "#FDE047" },
  "high": { label: "HIGH", color: "#F97316" },
  "very-high": { label: "CRIT", color: "#EF4444" },
};

const STATS = [
  { number: "14M+", label: "Daily Commuters" },
  { number: "5+", label: "Signal Sources" },
  { number: "90%+", label: "Prediction Accuracy" },
  { number: "24/7", label: "Live Monitoring" },
];

const BOXES = [
  { top: "14%", left: "42%", w: 52, h: 56 },
  { top: "10%", left: "56%", w: 44, h: 48 },
  { top: "28%", left: "48%", w: 58, h: 62 },
  { top: "8%", left: "68%", w: 46, h: 50 },
  { top: "22%", left: "62%", w: 54, h: 58 },
  { top: "38%", left: "72%", w: 40, h: 44 },
  { top: "18%", left: "80%", w: 48, h: 52 },
  { top: "46%", left: "50%", w: 56, h: 60 },
  { top: "50%", left: "66%", w: 42, h: 46 },
  { top: "44%", left: "78%", w: 50, h: 54 },
];

/* ─── Main Page ─────────────────────────────────── */
export default function Home() {
  const [tickerIdx, setTickerIdx] = useState(0);
  const [tickerKey, setTickerKey] = useState(0);
  const [query, setQuery] = useState("");
  const [time, setTime] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [isLogged, setIsLogged] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [tickerAlerts, setTickerAlerts] = useState<string[]>(TICKER_ALERTS_FALLBACK);
  const [liveStations, setLiveStations] = useState<any[]>(LIVE_STATIONS_FALLBACK);
  const [featureBars, setFeatureBars] = useState<any[]>(FEATURE_BARS_FALLBACK);

  /* Stats counter animation */
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStatsVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) {
      try {
        JSON.parse(u);
        setIsLogged(true);
      } catch (e) {}
    }
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const res = await api.getModelInfo();
        if (res && res.feature_importances) {
          const bars = Object.entries(res.feature_importances)
            .map(([k, v]) => ({ label: k, pct: Math.round((v as number) * 100) }))
            .sort((a, b) => b.pct - a.pct)
            .slice(0, 5);
          if (bars.length > 0) setFeatureBars(bars);
        }
      } catch (err) {
        console.warn("Failed to fetch model info:", err);
      }
    };
    fetchFeatures();

    const fetchData = async () => {
      try {
        const { data: alerts } = await supabase.from('ticker_alerts').select('message');
        if (alerts && alerts.length > 0) {
          setTickerAlerts(alerts.map(a => a.message));
        }
        const { data: stations } = await supabase.from('live_stations').select('*').order('id', { ascending: false }).limit(5);
        if (stations && stations.length > 0) {
          setLiveStations(stations);
        }
      } catch (err) {
        console.warn('Failed to fetch from supabase', err);
      }
    };
    fetchData();

    const sub = supabase
      .channel('home_live_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ticker_alerts' }, payload => {
        setTickerAlerts(prev => [...prev, (payload.new as any).message]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_stations' }, payload => {
        setLiveStations(prev => [(payload.new as any), ...prev].slice(0, 5));
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, []);

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

  return (
    <div style={{ fontFamily: "var(--font-body)" }}>

      {/* ═══════════════════════════════════════════════
          NAVIGATION — Fixed top, black, brutalist
          ═══════════════════════════════════════════════ */}
      <nav id="main-nav" style={{
        position: "sticky", top: 0, zIndex: 100,
        height: "var(--nav-height)",
        background: "var(--bg-nav)",
        display: "flex", alignItems: "center",
        padding: "0 var(--container-padding)",
        borderBottom: "1px solid var(--border-on-dark)",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36,
            background: "var(--color-accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span className="font-display" style={{ fontSize: 16, color: "var(--text-on-accent)", lineHeight: 1 }}>CS</span>
          </div>
          <span className="font-display" style={{ fontSize: 22, color: "var(--text-on-dark)", letterSpacing: "0.02em" }}>
            CROWDSENSE<span style={{ color: "var(--color-accent)" }}> MUMBAI</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hide-mobile" style={{ display: "flex", gap: 4, marginLeft: "auto", marginRight: 24, alignItems: "center" }}>
          {[
            { label: "Dashboard", href: "/dashboard", icon: "⬡" },
            { label: "Commuter", href: "/commuter", icon: "🚆" },
            { label: "Analytics", href: "/analytics", icon: "📊" },
            { label: "Alerts", href: "/alerts", icon: "🔔" },
            { label: "Map", href: "/map", icon: "🗺" },
          ].map(item => (
            <Link
              key={item.label}
              href={item.href}
              className="nav-link"
              style={{
                color: "var(--neutral-400)",
                padding: "8px 14px",
                display: "flex", alignItems: "center", gap: 6,
                borderRadius: 0,
                transition: "color 0.2s, background 0.2s",
                fontSize: 12,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = "var(--color-accent)";
                e.currentTarget.style.background = "rgba(255,224,102,0.06)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = "var(--neutral-400)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: 13 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div style={{ width: 1, height: 20, background: "var(--border-on-dark)", margin: "0 8px" }} />
          {!authLoading && isLogged ? (
            <button className="nav-link" style={{ background:"none", border:"none", color: "var(--neutral-400)", padding: "8px 14px", fontSize: 12, cursor:"pointer" }}
              onClick={() => { localStorage.removeItem("user"); window.location.reload(); }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-accent)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--neutral-400)")}
            >Logout</button>
          ) : (
            <Link href="/login" className="nav-link" style={{ color: "var(--neutral-400)", padding: "8px 14px", fontSize: 12 }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-accent)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--neutral-400)")}
            >Login</Link>
          )}
        </div>

        {/* CTA */}
        <div className="hide-mobile">
          {!authLoading && isLogged ? (
            <Link href="/dashboard" className="btn-accent" style={{ padding: "10px 20px" }}>
              Dashboard →
            </Link>
          ) : (
             <Link href="/signup" className="btn-accent" style={{ padding: "10px 20px" }}>
               Sign Up →
             </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="hide-desktop"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            marginLeft: "auto", background: "none", border: "none",
            color: "var(--text-on-dark)", fontSize: 24, cursor: "pointer", padding: 8,
          }}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? "×" : "≡"}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="hide-desktop" style={{
          position: "fixed", top: "var(--nav-height)", left: 0, right: 0, bottom: 0,
          background: "var(--bg-section-alt)", zIndex: 99,
          display: "flex", flexDirection: "column", padding: "32px var(--container-padding)", gap: 8,
        }}>
          {[
            { label: "Dashboard", href: "/dashboard", icon: "⬡" },
            { label: "Commuter AI", href: "/commuter", icon: "🚆" },
            { label: "Analytics", href: "/analytics", icon: "📊" },
            { label: "Alerts", href: "/alerts", icon: "🔔" },
            { label: "Live Map", href: "/map", icon: "🗺" },
          ].map(item => (
            <Link
              key={item.label}
              href={item.href}
              className="nav-link"
              style={{ color: "var(--text-on-dark)", fontSize: 18, padding: "14px 0", borderBottom: "1px solid var(--border-on-dark)", display: "flex", alignItems: "center", gap: 12 }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          {!authLoading && isLogged ? (
            <>
              <button className="nav-link" style={{ background:"none", border:"none", color: "var(--text-on-dark)", fontSize: 18, padding: "14px 0", borderBottom: "1px solid var(--border-on-dark)", display: "flex", alignItems: "center", gap: 12, cursor:"pointer", textAlign: "left", fontFamily: "inherit" }} onClick={() => { localStorage.removeItem("user"); window.location.reload(); }}>
                <span>→</span>Logout
              </button>
              <Link href="/dashboard" className="btn-accent" style={{ marginTop: 24, width: "fit-content" }} onClick={() => setMobileMenuOpen(false)}>Dashboard →</Link>
            </>
          ) : (
             <>
               <Link href="/login" className="nav-link" style={{ color: "var(--text-on-dark)", fontSize: 18, padding: "14px 0", borderBottom: "1px solid var(--border-on-dark)", display: "flex", alignItems: "center", gap: 12 }} onClick={() => setMobileMenuOpen(false)}>
                 <span>→</span>Login
               </Link>
               <Link href="/signup" className="btn-accent" style={{ marginTop: 24, width: "fit-content" }} onClick={() => setMobileMenuOpen(false)}>Sign Up →</Link>
             </>
          )}
        </div>
      )}


      {/* ═══════════════════════════════════════════════
          HERO — Dark section, full-bleed image right
          ═══════════════════════════════════════════════ */}
      <section id="home" style={{
        position: "relative",
        minHeight: "var(--hero-min-height)",
        background: "var(--bg-section-alt)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Background Image — right 65% */}
        <div style={{ position: "absolute", inset: 0 }}>
          <Image
            src="/crowd-detection.png"
            alt="AI crowd detection at Mumbai railway station showing real-time passenger counting"
            fill
            style={{ objectFit: "cover", objectPosition: "center right" }}
            priority
          />
          {/* Solid dark overlay — left text area */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to right, var(--bg-section-alt) 40%, rgba(10,10,10,0.6) 65%, transparent 100%)",
          }} />
          {/* Bottom solid fade */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "30%",
            background: "linear-gradient(to top, var(--bg-section-alt) 0%, transparent 100%)",
          }} />

          {/* Detection boxes */}
          {BOXES.map((b, i) => (
            <div
              key={i}
              className="det-box"
              style={{
                top: b.top, left: b.left,
                width: b.w, height: b.h,
                animationDelay: `${i * 0.22}s`,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div style={{
          position: "relative", zIndex: 10,
          flex: 1,
          display: "flex", alignItems: "center",
          padding: `calc(var(--nav-height) + 48px) var(--container-padding) 48px`,
        }}>
          <div style={{ maxWidth: 640 }}>

            {/* Live badge */}
            <div className="fade-up" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              marginBottom: 24,
            }}>
              <span className="animate-live" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--crowd-low)", display: "inline-block" }} />
              <span className="label-caps" style={{ color: "var(--crowd-low)", fontSize: 10 }}>
                Live Crowd Intelligence · Mumbai City
              </span>
            </div>

            {/* Headline */}
            <h1 className="display-hero fade-up" style={{
              color: "var(--text-on-dark)",
              margin: "0 0 24px",
              animationDelay: "100ms",
            }}>
              PREDICT<br />
              THE <span style={{ color: "var(--color-accent)" }}>CROWD</span>
            </h1>

            <p className="display-lg fade-up" style={{
              color: "var(--neutral-400)",
              fontWeight: 500,
              margin: "0 0 16px",
              animationDelay: "180ms",
            }}>
              before it happens.
            </p>

            {/* Body text */}
            <p className="body-lg fade-up" style={{
              color: "var(--neutral-400)",
              maxWidth: 440,
              margin: "0 0 40px",
              animationDelay: "260ms",
            }}>
              Real-time AI crowd sensing for Mumbai&apos;s 14 million daily commuters — combining tidal data, weather signals, and social feeds.
            </p>

            {/* CTA Group */}
            <div className="fade-up" style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", animationDelay: "340ms" }}>
              {/* Search Bar */}
              <div style={{
                display: "flex", alignItems: "center",
                border: "2px solid var(--border-on-dark)",
                background: "var(--bg-card-dark)",
                flex: "1 1 300px", maxWidth: 420,
              }}>
                <span className="font-mono" style={{
                  color: "var(--color-accent)", paddingLeft: 16, paddingRight: 4,
                  fontSize: 14, fontWeight: 700, opacity: 0.6, flexShrink: 0,
                }}>$</span>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search station or line..."
                  style={{
                    flex: 1, background: "transparent",
                    border: "none", padding: "14px 8px",
                    fontSize: 14, fontFamily: "var(--font-body)",
                    color: "var(--text-on-dark)",
                    minWidth: 0, outline: "none",
                }}
              />
              <Link href={!authLoading && isLogged ? "/commuter" : "/login"} className="btn-accent" style={{
                margin: 4, padding: "10px 20px", fontSize: 11,
                letterSpacing: "0.16em",
              }}>ASK</Link>
            </div>

            {/* Arrow CTA */}
            {!authLoading && isLogged ? (
              <Link href="/dashboard" className="btn-arrow-circle" aria-label="Dashboard">
                ↗
              </Link>
            ) : (
              <Link href="/login" className="btn-arrow-circle" aria-label="Get Started">
                ↗
              </Link>
            )}
          </div>
        </div>
      </div>

        {/* Ticker Strip */}
        <div style={{
          position: "relative", zIndex: 10,
          height: 44,
          background: "var(--color-black-rich)",
          borderTop: "1px solid var(--border-on-dark)",
          display: "flex", alignItems: "center",
          overflow: "hidden",
        }}>
          <div style={{
            flexShrink: 0,
            background: "var(--color-accent)",
            height: "100%",
            padding: "0 20px",
            display: "flex", alignItems: "center",
          }}>
            <span className="btn-text" style={{ color: "var(--text-on-accent)", fontSize: 11 }}>
              LIVE
            </span>
          </div>
          <div style={{ flex: 1, overflow: "hidden", padding: "0 20px" }}>
            <span
              key={tickerKey}
              className="ticker-anim font-mono"
              style={{ fontSize: 12, color: "var(--neutral-400)", display: "block" }}
            >
              {tickerAlerts[tickerIdx] || ""}
            </span>
          </div>
          <div className="font-mono" style={{ fontSize: 10, color: "var(--text-label)", padding: "0 20px", flexShrink: 0 }}>
            {time} IST
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════
          SERVICES — White section, 3-col grid
          ═══════════════════════════════════════════════ */}
      <section id="about" style={{
        background: "var(--bg-page)",
        padding: "var(--section-padding-y) var(--container-padding)",
      }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
          <div className="section-label fade-up">OUR SIGNALS</div>
          <h2 className="display-xl fade-up" style={{
            color: "var(--text-primary)",
            maxWidth: 640,
            margin: "0 0 var(--space-16)",
            animationDelay: "80ms",
          }}>
            What Powers<br />CrowdSense
          </h2>

          {/* Divider rule */}
          <div className="divider-rule" style={{ marginBottom: "var(--space-16)" }} />

          {/* 3-col service cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--card-gap)",
          }}>
            {/* Card 1 — Outlined */}
            <ServiceCard
              variant="outlined"
              icon={<WeatherIcon size={40} />}
              title="Weather & Tide Signals"
              body="Monsoon rainfall, humidity, temperature, and Arabian Sea tidal patterns — all feeding the prediction model in real-time."
            />
            {/* Card 2 — Filled Dark */}
            <ServiceCard
              variant="filled-dark"
              icon={<TrafficIcon size={40} />}
              title="Traffic & Transit Analysis"
              body="Western Express Highway congestion, local train delays, metro load data — correlated with crowd density at intersections."
            />
            {/* Card 3 — Filled Accent */}
            <ServiceCard
              variant="filled-accent"
              icon={<AgentIcon size={40} />}
              title="AI Agent Intelligence"
              body="LangGraph-powered multi-agent system processing 1,200+ signals per second to predict crowd surges 30 minutes ahead."
            />
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════
          LIVE STATIONS — Dark section
          ═══════════════════════════════════════════════ */}
      <section id="work" style={{
        background: "var(--bg-section-alt)",
        padding: "var(--section-padding-y) var(--container-padding)",
      }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
          <div className="section-label section-label--on-dark fade-up">LIVE DATA</div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: "var(--space-8)" }}>
            <h2 className="display-xl fade-up" style={{
              color: "var(--text-on-dark)",
              maxWidth: 500,
              margin: 0,
              animationDelay: "80ms",
            }}>
              Live Station<br />Feed
            </h2>
            <div className="fade-up" style={{ display: "flex", alignItems: "center", gap: 8, animationDelay: "160ms" }}>
              <span className="animate-live" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--crowd-low)", display: "inline-block" }} />
              <span className="label-caps" style={{ color: "var(--crowd-low)" }}>Updated now</span>
            </div>
          </div>

          <div className="divider-rule divider-rule--dark" style={{ marginBottom: "var(--space-8)" }} />

          {/* Station Grid — 2 columns on desktop */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "var(--card-gap)",
          }}>
            {/* Station List */}
            <div style={{
              background: "var(--bg-card-dark)",
              border: "1px solid var(--border-on-dark)",
              overflow: "hidden",
            }}>
              {liveStations.map((s) => {
                const cm = crowdMeta[s.crowd] || crowdMeta["medium"];
                return (
                  <div key={s.name} className="m-row m-row--dark">
                    <div className="line-dot" style={{ background: s.lineColor, marginRight: 14 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="heading-sm" style={{ color: "var(--text-on-dark)", fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {s.name}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <span className="label-caps" style={{
                          padding: "2px 6px",
                          border: "1px solid var(--border-on-dark)",
                          color: "var(--neutral-400)",
                        }}>{s.line}</span>
                        <span className="label-caps" style={{ color: "var(--neutral-500)" }}>PF {s.platform}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", marginLeft: 16, flexShrink: 0 }}>
                      <div className="font-heading" style={{ fontSize: 22, fontWeight: 800, color: "var(--color-accent)", lineHeight: 1 }}>
                        {s.count}
                      </div>
                      <div className="label-caps" style={{ color: "var(--neutral-500)", marginTop: 2 }}>PAX</div>
                    </div>
                    <div style={{ marginLeft: 16, flexShrink: 0 }}>
                      <span className="crowd-pill" style={{ color: cm.color, borderColor: cm.color }}>
                        {cm.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Heatmap Card */}
            <div style={{
              background: "var(--bg-card-dark)",
              border: "1px solid var(--border-on-dark)",
              overflow: "hidden",
              display: "flex", flexDirection: "column",
            }}>
              <div style={{ position: "relative", height: 320, width: "100%", flexShrink: 0 }}>
                <Image
                  src="/crowd-heatmap.png"
                  alt="Mumbai crowd density heatmap showing high and low concentration zones"
                  fill
                  style={{ objectFit: "cover" }}
                />
                {/* Bottom overlay for text readability */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
                  background: "linear-gradient(to top, var(--bg-card-dark) 0%, transparent 100%)",
                }} />
                <div style={{
                  position: "absolute", bottom: 16, left: 20, right: 20,
                  display: "flex", justifyContent: "space-between", alignItems: "flex-end",
                }}>
                  <div>
                    <div className="label-caps" style={{ color: "#60A5FA", marginBottom: 2 }}>Low Density Zone</div>
                    <div className="body-sm" style={{ color: "var(--neutral-400)" }}>Suburbs · Safe to travel</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="label-caps" style={{ color: "#EF4444", marginBottom: 2 }}>High Density Zone</div>
                    <div className="body-sm" style={{ color: "var(--neutral-400)" }}>Central belt · Avoid peak</div>
                  </div>
                </div>
              </div>
              <div style={{
                padding: "14px 20px",
                borderTop: "1px solid var(--border-on-dark)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span className="heading-sm" style={{ color: "var(--text-on-dark)", fontSize: 13, fontWeight: 700 }}>
                  Mumbai Density Map · {time} IST
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="animate-live" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--crowd-low)", display: "inline-block" }} />
                  <span className="label-caps" style={{ color: "var(--crowd-low)" }}>Live</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════
          STATS — White section, 4-col
          ═══════════════════════════════════════════════ */}
      <section ref={statsRef} style={{
        background: "var(--bg-page)",
        padding: "var(--section-padding-y) var(--container-padding)",
      }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
          <div className="section-label fade-up">BY THE NUMBERS</div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            borderTop: "2px solid var(--border-default)",
            borderBottom: "2px solid var(--border-default)",
          }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{
                padding: "var(--space-8) var(--space-6)",
                borderRight: i < STATS.length - 1 ? "1px solid var(--border-light)" : "none",
                opacity: statsVisible ? 1 : 0,
                transform: statsVisible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`,
              }}>
                <div className="stat-number" style={{ color: "var(--text-primary)", marginBottom: 6 }}>
                  {s.number}
                </div>
                <div className="stat-label" style={{ color: "var(--text-muted)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════
          FEATURE WEIGHTS — Dark section
          ═══════════════════════════════════════════════ */}
      <section style={{
        background: "var(--bg-section-alt)",
        padding: "var(--section-padding-y) var(--container-padding)",
      }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
          <div className="section-label section-label--on-dark fade-up">NEURAL ANALYSIS</div>
          <h2 className="display-xl fade-up" style={{
            color: "var(--text-on-dark)",
            maxWidth: 500,
            margin: "0 0 var(--space-12)",
            animationDelay: "80ms",
          }}>
            Feature<br />Weights
          </h2>

          <div className="divider-rule divider-rule--dark" style={{ marginBottom: "var(--space-8)" }} />

          {/* Split layout: bars left, signals right */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "var(--space-10)",
          }}>
            {/* Feature Bars */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {featureBars.map(f => (
                <div key={f.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span className="meta-text" style={{ color: "var(--neutral-400)", textTransform: "uppercase" }}>
                      {f.label}
                    </span>
                    <span className="meta-text" style={{ color: "var(--color-accent)" }}>{f.pct}%</span>
                  </div>
                  <div style={{ height: 4, background: "var(--border-on-dark)", overflow: "hidden" }}>
                    <div
                      className="bar-anim"
                      style={{
                        height: "100%",
                        width: `${f.pct}%`,
                        background: "var(--color-accent)",
                        animationDuration: "1.2s",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Signal cards 2×2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--card-gap)" }}>
              <SignalCard label="Weather" value="32°C" sub="Humidity 80% · Showers likely" color="#60A5FA" icon={<WeatherIcon size={20} />} />
              <SignalCard label="Traffic" value="HIGH" sub="WEH: +15 min delay near JVLR" color="#EF4444" icon={<TrafficIcon size={20} />} />
              <SignalCard label="Tide" value="4.5 m" sub="High tide 16:20 · Juhu / Marine Dr." color="#FDE047" icon={<TideIcon size={20} />} />
              <SignalCard label="AI Agent" value="Active" sub="LangGraph processing 1.2k signals/sec" color="#818CF8" icon={<AgentIcon size={20} />} />
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════
          ABOUT / CTA — White section
          ═══════════════════════════════════════════════ */}
      <section style={{
        background: "var(--bg-page)",
        padding: "var(--section-padding-y) var(--container-padding)",
      }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
          <div className="section-label fade-up">ABOUT US</div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "var(--space-16)",
            alignItems: "center",
          }}>
            <div>
              <h2 className="display-lg fade-up" style={{
                color: "var(--text-primary)",
                margin: "0 0 var(--space-6)",
              }}>
                Built for the Heartbeat of India
              </h2>
              <p className="body-lg fade-up" style={{
                color: "var(--text-secondary)",
                maxWidth: 440,
                margin: "0 0 var(--space-8)",
                animationDelay: "80ms",
              }}>
                CrowdSense Mumbai is an AI-powered urban intelligence platform built by Team Technexis. We combine computer vision, multi-signal analysis, and agentic AI to help 14 million daily commuters navigate the city safely and efficiently.
              </p>
              <div className="fade-up" style={{ display: "flex", gap: 12, animationDelay: "160ms", flexWrap: "wrap" }}>
                {!authLoading && isLogged ? (
                  <Link href="/dashboard" className="btn-primary">Dashboard →</Link>
                ) : (
                  <Link href="/login" className="btn-primary">Get Started →</Link>
                )}
                <Link href="/map" className="btn-ghost">View Map</Link>
              </div>
            </div>
            <div style={{
              position: "relative",
              height: 360,
              border: "1px solid var(--border-default)",
              overflow: "hidden",
            }}>
              <Image
                src="/skyline.png"
                alt="Mumbai skyline showing the dense urban landscape of India's financial capital"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════
          FOOTER — Dark section
          ═══════════════════════════════════════════════ */}
      <footer style={{
        background: "var(--bg-section-alt)",
        borderTop: "1px solid var(--border-on-dark)",
        padding: "var(--space-16) var(--container-padding) var(--space-8)",
      }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
          {/* Top row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--space-10)",
            marginBottom: "var(--space-10)",
          }}>
            {/* Brand */}
            <div>
              <div className="font-display" style={{ fontSize: 24, color: "var(--text-on-dark)", marginBottom: 12, letterSpacing: "0.02em" }}>
                CROWDSENSE<span style={{ color: "var(--color-accent)" }}> MUMBAI</span>
              </div>
              <p className="body-sm" style={{ color: "var(--neutral-500)", maxWidth: 260 }}>
                Signal-aware urban intelligence. Predict the crowd before it happens.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <div className="label-caps" style={{ color: "var(--neutral-400)", marginBottom: 16 }}>Navigation</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["Home", "Map View", "Login", "Sign Up"].map(l => (
                  <Link key={l} href={l === "Home" ? "/" : l === "Map View" ? "/map" : l === "Login" ? "/login" : "/signup"}
                    className="body-sm" style={{ color: "var(--text-on-dark)", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--color-accent)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--text-on-dark)")}
                  >{l}</Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <div className="label-caps" style={{ color: "var(--neutral-400)", marginBottom: 16 }}>Contact</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span className="meta-text" style={{ color: "var(--neutral-500)" }}>team@technexis.in</span>
                <span className="meta-text" style={{ color: "var(--neutral-500)" }}>Mumbai, Maharashtra</span>
                <span className="meta-text" style={{ color: "var(--neutral-500)" }}>Hack4Innovation 2026</span>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            borderTop: "1px solid var(--border-on-dark)",
            paddingTop: "var(--space-6)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 12,
          }}>
            <span className="body-sm" style={{ color: "var(--neutral-500)" }}>
              © 2026 CrowdSense Mumbai — Team Technexis
            </span>
            <div style={{ display: "flex", gap: 24 }}>
              {["API Docs", "Privacy", "GitHub", "Status"].map(l => (
                <a key={l} href="#" className="body-sm" style={{ color: "var(--neutral-500)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--color-accent)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--neutral-500)")}
                >{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════ */

/* ── Service Card ────────────────────────────────── */
function ServiceCard({ variant, icon, title, body }: {
  variant: "outlined" | "filled-dark" | "filled-accent";
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  const styles: Record<string, React.CSSProperties> = {
    "outlined": {
      background: "var(--bg-page)",
      border: "1px solid var(--border-default)",
      color: "var(--text-primary)",
      padding: "32px 24px",
    },
    "filled-dark": {
      background: "var(--bg-card-dark)",
      border: "none",
      color: "var(--text-on-dark)",
      padding: "32px 24px",
    },
    "filled-accent": {
      background: "var(--bg-card-accent)",
      border: "none",
      color: "var(--text-on-accent)",
      padding: "32px 24px",
    },
  };
  const s = styles[variant];

  return (
    <div style={{
      ...s,
      transition: "border-color var(--duration-fast) ease",
      cursor: "default",
    }}
      onMouseEnter={e => {
        if (variant === "outlined") {
          e.currentTarget.style.borderColor = "var(--color-accent)";
        }
      }}
      onMouseLeave={e => {
        if (variant === "outlined") {
          e.currentTarget.style.borderColor = "var(--border-default)";
        }
      }}
    >
      <div style={{ marginBottom: 24, opacity: 0.9 }}>{icon}</div>
      <h3 className="heading-sm" style={{ color: "inherit", marginBottom: 12 }}>{title}</h3>
      <p className="body-md" style={{ color: "inherit", opacity: 0.75 }}>{body}</p>
    </div>
  );
}


/* ── Signal Card ─────────────────────────────────── */
function SignalCard({ label, value, sub, color, icon }: {
  label: string; value: string; sub: string; color: string; icon: React.ReactNode;
}) {
  return (
    <div style={{
      background: "var(--bg-card-dark)",
      border: "1px solid var(--border-on-dark)",
      padding: "16px 20px",
      transition: "border-color var(--duration-fast) ease",
      cursor: "default",
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--color-accent)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-on-dark)")}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span className="label-caps" style={{ color: "var(--neutral-500)" }}>{label}</span>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="font-heading" style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1, marginBottom: 8 }}>
        {value}
      </div>
      <div className="body-sm" style={{ color: "var(--neutral-500)", lineHeight: 1.5 }}>{sub}</div>
    </div>
  );
}


/* ── Icons — outlined, geometric, 2px stroke ─────── */
function WeatherIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="square" strokeLinejoin="miter" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  );
}

function TrafficIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="square" strokeLinejoin="miter" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  );
}

function TideIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="square" strokeLinejoin="miter" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M3.284 14.253A9 9 0 0112 3a9 9 0 018.716 11.253" />
    </svg>
  );
}

function AgentIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="square" strokeLinejoin="miter" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}