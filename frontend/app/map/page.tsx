"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useAuthGuard } from "../lib/useAuthGuard";
import { api } from "../lib/api";


// ── Types ──────────────────────────────────────────────────────
type LocationPoint = {
  name: string;
  lat: number;
  lng: number;
  type: string;
  crowd_score: number;
};

// ── Severity helpers ───────────────────────────────────────────
function getMeta(score: number) {
  if (score < 30) return { color: "#22C55E", label: "LOW",      glow: "rgba(34,197,94,0.5)",   pinBg: "#14532d" };
  if (score < 55) return { color: "#FDE047", label: "MODERATE", glow: "rgba(253,224,71,0.5)",   pinBg: "#713f12" };
  if (score < 80) return { color: "#F97316", label: "HIGH",     glow: "rgba(249,115,22,0.6)",  pinBg: "#7c2d12" };
  return            { color: "#EF4444", label: "CRITICAL",      glow: "rgba(239,68,68,0.7)",   pinBg: "#7f1d1d" };
}

// Type → emoji badge
const TYPE_ICON: Record<string, string> = {
  railway: "🚉", beach: "🏖️", market: "🛒", office_zone: "🏢",
  religious: "🕌", tourism: "📸", airport: "✈️", stadium: "🏟️",
  transit_hub: "🚌", hospital: "🏥"
};

// ── Google Maps dark style ─────────────────────────────────────
const DARK_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0d1117" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0d1117" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#4B5472" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#1e2a3b" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e2a45" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#374661" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#1a3a5c" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#172035" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#9CA3B8" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#060d18" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#1e2a45" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
];

// ── Page Component ─────────────────────────────────────────────
export default function MumbaiMapPage() {
  const { isLoading: authLoading } = useAuthGuard();
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [selected, setSelected] = useState<LocationPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [time, setTime] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";


  // ── Clock ────────────────────────────────────────────────────
  useEffect(() => {
    const iv = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  // ── Fetch crowd data directly (no api.ts wrapper needed) ─────
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const hour = new Date().getHours();
      const json = await api.getCompare(hour);
      const pts: LocationPoint[] = (json.ranked_locations ?? [])
        .filter((d: any) => d.lat && d.lng)
        .map((d: any) => ({
          name: d.location, lat: d.lat, lng: d.lng, type: d.type, crowd_score: d.crowd_score
        }));
      setLocations(pts);
      setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Backend unreachable: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 90_000);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (authLoading) return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#444", letterSpacing: "0.1em" }}>AUTHENTICATING...</div>
    </div>
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0B0F1A", color: "#F0EEE8", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav style={{ height: 52, background: "#080C15", borderBottom: "0.5px solid #2A3352", display: "flex", alignItems: "center", padding: "0 20px", gap: 14, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: "#F97316", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px rgba(249,115,22,0.4)" }}>
            <span style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 9, fontWeight: 900, color: "#0B0F1A" }}>CS</span>
          </div>
          <span style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 15, fontWeight: 700 }}>
            CrowdSense <span style={{ color: "#F97316" }}>Live Map</span>
          </span>
        </div>

        {/* Status pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: loading ? "rgba(249,115,22,0.08)" : "rgba(34,197,94,0.08)", border: `0.5px solid ${loading ? "rgba(249,115,22,0.3)" : "rgba(34,197,94,0.3)"}`, borderRadius: 20, padding: "4px 12px" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: loading ? "#F97316" : "#22C55E", animation: "live-pulse 1.4s ease-in-out infinite" }} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: loading ? "#F97316" : "#22C55E" }}>
            {loading ? "FETCHING DATA..." : `LIVE · ${locations.length} ZONES · ${lastUpdated}`}
          </span>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#4B5472" }}>{time} IST</span>
          <Link href="/commuter" style={{ padding: "6px 14px", background: "rgba(249,115,22,0.1)", color: "#F97316", border: "0.5px solid rgba(249,115,22,0.4)", borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: "none", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em" }}>← COMMUTER</Link>
          <Link href="/" style={{ padding: "6px 14px", color: "#9CA3B8", border: "0.5px solid #2A3352", borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: "none", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em" }}>HOME</Link>
        </div>
      </nav>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── Sidebar ── */}
        <aside style={{ width: 270, background: "#080C15", borderRight: "0.5px solid #2A3352", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
          {/* Header */}
          <div style={{ padding: "14px 16px 10px", borderBottom: "0.5px solid #2A3352" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#4B5472", textTransform: "uppercase", marginBottom: 2 }}>Crowd Severity Ranking</div>
            <div style={{ fontSize: 11, color: "#4B5472" }}>{locations.length} zones monitored</div>
          </div>

          {/* Legend */}
          <div style={{ padding: "8px 16px", borderBottom: "0.5px solid #2A3352", display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[{ l: "LOW", c: "#22C55E" }, { l: "MODERATE", c: "#FDE047" }, { l: "HIGH", c: "#F97316" }, { l: "CRITICAL", c: "#EF4444" }].map(x => (
              <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: x.c, boxShadow: `0 0 6px ${x.c}` }} />
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: x.c, fontWeight: 700 }}>{x.l}</span>
              </div>
            ))}
          </div>

          {/* Error state */}
          {error && (
            <div style={{ margin: 12, padding: "10px 12px", background: "rgba(239,68,68,0.08)", border: "0.5px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 11, color: "#EF4444" }}>
              ⚠️ {error}<br />
              <span style={{ color: "#4B5472" }}>Showing cached data. Click Refresh.</span>
            </div>
          )}

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {locations.map((loc, i) => {
              const m = getMeta(loc.crowd_score);
              const isSel = selected?.name === loc.name;
              return (
                <div
                  key={loc.name}
                  onClick={() => setSelected(isSel ? null : loc)}
                  style={{ padding: "10px 16px", borderBottom: "0.5px solid #111827", cursor: "pointer", background: isSel ? "rgba(249,115,22,0.06)" : "transparent", transition: "background 150ms", display: "flex", alignItems: "center", gap: 10 }}
                >
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#4B5472", minWidth: 20 }}>{i + 1}</span>
                  <span style={{ fontSize: 14 }}>{TYPE_ICON[loc.type] ?? "📍"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{loc.name}</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: "#4B5472", marginTop: 1 }}>{loc.type.replace("_", " ").toUpperCase()}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: m.color, fontWeight: 700 }}>{loc.crowd_score}</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 8, color: m.color, opacity: 0.8 }}>{m.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Refresh */}
          <div style={{ padding: 10, borderTop: "0.5px solid #2A3352" }}>
            <button
              onClick={() => fetchData()}
              disabled={loading}
              style={{ width: "100%", padding: "9px 0", background: loading ? "rgba(74,84,114,0.1)" : "rgba(249,115,22,0.1)", border: `0.5px solid ${loading ? "#2A3352" : "rgba(249,115,22,0.35)"}`, borderRadius: 7, color: loading ? "#4B5472" : "#F97316", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", cursor: loading ? "not-allowed" : "pointer", textTransform: "uppercase", transition: "all 200ms" }}
            >
              {loading ? "⏳ Fetching…" : "↺ Refresh Data"}
            </button>
          </div>
        </aside>

        {/* ── Map ── */}
        <div style={{ flex: 1, position: "relative" }}>
          {/* Loading overlay */}
          {loading && locations.length === 0 && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(11,15,26,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, flexDirection: "column", gap: 14 }}>
              <div style={{ width: 40, height: 40, border: "3px solid #2A3352", borderTop: "3px solid #F97316", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: "0.1em", color: "#9CA3B8" }}>FETCHING CROWD DATA…</span>
            </div>
          )}

          {apiKey ? (
            <APIProvider apiKey={apiKey}>
              <Map
                mapId="crowdsense-dark"
                defaultCenter={{ lat: 19.0500, lng: 72.8777 }}
                defaultZoom={12}
                gestureHandling="greedy"
                disableDefaultUI={false}
                styles={DARK_STYLE}
                style={{ width: "100%", height: "100%" }}
              >
                {locations.map((loc) => {
                  const m = getMeta(loc.crowd_score);
                  const isSel = selected?.name === loc.name;
                  const dotSize = loc.crowd_score > 75 ? 18 : loc.crowd_score > 50 ? 14 : 11;

                  return (
                    <AdvancedMarker
                      key={loc.name}
                      position={{ lat: loc.lat, lng: loc.lng }}
                      onClick={() => setSelected(isSel ? null : loc)}
                    >
                      <div style={{ position: "relative", cursor: "pointer" }}>
                        {/* Pulsing glow ring for high crowd */}
                        {loc.crowd_score >= 60 && (
                          <div style={{ position: "absolute", inset: -12, borderRadius: "50%", background: m.glow, filter: "blur(6px)", animation: "live-pulse 2s ease-in-out infinite" }} />
                        )}
                        {/* Dot */}
                        <div style={{ width: isSel ? 22 : dotSize, height: isSel ? 22 : dotSize, borderRadius: "50%", background: m.color, border: `2.5px solid ${isSel ? "#fff" : "#080C15"}`, boxShadow: `0 0 ${isSel ? 22 : 8}px ${m.glow}`, transition: "all 220ms ease", position: "relative", zIndex: 2 }} />

                        {/* Floating label card */}
                        <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", background: "rgba(8,12,21,0.92)", border: `0.5px solid ${m.color}`, borderRadius: 6, padding: "4px 8px", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 10 }}>
                          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, color: "#F0EEE8" }}>
                            {TYPE_ICON[loc.type] ?? "📍"} {loc.name}
                          </div>
                          <div style={{ display: "flex", gap: 5, alignItems: "center", marginTop: 1 }}>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: m.color, fontWeight: 700 }}>{loc.crowd_score}</span>
                            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: m.color }}>/ 100 · {m.label}</span>
                          </div>
                        </div>
                      </div>
                    </AdvancedMarker>
                  );
                })}
              </Map>
            </APIProvider>
          ) : (
            <div style={{ inset: 0, position: "absolute", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
              <span style={{ fontSize: 32 }}>🗺️</span>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "#F97316", letterSpacing: "0.06em" }}>GOOGLE MAPS API KEY REQUIRED</div>
              <div style={{ fontSize: 12, color: "#4B5472" }}>Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in frontend/.env.local</div>
            </div>
          )}

          {/* Selected pin info card */}
          {selected && (
            <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#111827", border: `1px solid ${getMeta(selected.crowd_score).color}`, borderRadius: 12, padding: "14px 18px", minWidth: 300, boxShadow: `0 8px 40px rgba(0,0,0,0.8), 0 0 20px ${getMeta(selected.crowd_score).glow}`, zIndex: 200, display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", background: getMeta(selected.crowd_score).pinBg, border: `2px solid ${getMeta(selected.crowd_score).color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: getMeta(selected.crowd_score).color }}>{selected.crowd_score}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                  {TYPE_ICON[selected.type] ?? "📍"} {selected.name}
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "#4B5472", textTransform: "uppercase" }}>{selected.type.replace("_", " ")}</span>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, color: getMeta(selected.crowd_score).color }}>{getMeta(selected.crowd_score).label}</span>
                </div>
                <div style={{ height: 4, background: "#2A3352", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${selected.crowd_score}%`, background: `linear-gradient(90deg, ${getMeta(selected.crowd_score).color}, ${getMeta(selected.crowd_score).color}88)`, borderRadius: 4, transition: "width 1s ease" }} />
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#4B5472", cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@700&family=Barlow+Condensed:wght@400;600;700&family=Barlow+Semi+Condensed:wght@600;700&family=DM+Sans:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes live-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #080C15; }
        ::-webkit-scrollbar-thumb { background: #2A3352; border-radius: 2px; }
      `}</style>
    </div>
  );
}
