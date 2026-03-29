"use client";

import { useState, useEffect } from "react";
import { api, CompareLocation, ModelInfoResponse } from "../lib/api";

const LOCATIONS = [
  "Andheri Station",
  "Bandra Station",
  "Borivali Station",
  "CST Terminus",
  "Dadar Station",
  "Goregaon Station",
  "Kurla Station",
  "Malad Station",
  "Thane Station",
  "Siddhivinayak Temple",
  "Juhu Beach",
  "Marine Drive",
  "Gateway of India",
  "Phoenix Mall Lower Parel",
  "BKC Commercial Zone",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getColorForScore(score: number) {
  if (score < 40) return "rgba(34, 197, 94, 0.8)"; // Green
  if (score < 70) return "rgba(253, 224, 71, 0.8)"; // Soft Yellow
  if (score < 85) return "rgba(249, 115, 22, 0.8)"; // Orange
  return "rgba(239, 68, 68, 0.8)"; // Red
}

function getLabelForScore(score: number) {
  if (score < 40) return { label: "LOW", color: "#22C55E" };
  if (score < 70) return { label: "MED", color: "#FDE047" };
  if (score < 85) return { label: "HIGH", color: "#F97316" };
  return { label: "CRIT", color: "#EF4444" };
}

export default function PlannerTab() {
  const [hour, setHour] = useState(18); // Default 6 PM
  const [rankedLocations, setRankedLocations] = useState<CompareLocation[]>([]);
  const [selectedStation, setSelectedStation] = useState("Dadar Station");
  const [heatmapData, setHeatmapData] = useState<number[][]>([]);
  const [modelInfo, setModelInfo] = useState<Record<string, number> | null>(null);

  const [loadingCompare, setLoadingCompare] = useState(false);
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);

  // 1. Fetch Compare Data when Hour changes
  useEffect(() => {
    async function fetchCompare() {
      setLoadingCompare(true);
      try {
        const res = await api.getCompare(hour);
        setRankedLocations(res.ranked_locations);
      } catch (err) {
        console.error("Failed to fetch compare data", err);
      } finally {
        setLoadingCompare(false);
      }
    }
    fetchCompare();
  }, [hour]);

  // 2. Fetch Heatmap when Selected Station changes
  useEffect(() => {
    async function fetchHeatmap() {
      setLoadingHeatmap(true);
      try {
        const res = await api.getHeatmap(selectedStation);
        setHeatmapData(res.heatmap);
      } catch (err) {
        console.error("Failed to fetch heatmap data", err);
      } finally {
        setLoadingHeatmap(false);
      }
    }
    fetchHeatmap();
  }, [selectedStation]);

  // 3. Fetch Model Info on mount
  useEffect(() => {
    async function fetchModelInfo() {
      try {
        const res = await api.getModelInfo();
        setModelInfo(res.feature_importances);
      } catch (err) {
        console.error("Failed to fetch model info", err);
      }
    }
    fetchModelInfo();
  }, []);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 32 }}>

      {/* HEADER */}
      <div>
        <h2 className="font-heading" style={{ fontSize: 24, margin: "0 0 8px", color: "var(--text-primary)" }}>
          City Planner Console
        </h2>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14, maxWidth: 600, lineHeight: 1.5 }}>
          Analyze aggregate crowd densities across all major transport hubs and evaluate long-term temporal risk profiles to optimize city services and emergency responder allocation.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* LEFT COLUMN - RANKING */}
        <div style={{
          background: "var(--bg-card)", border: "0.5px solid var(--border)",
          borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column"
        }}>
          {/* Header */}
          <div style={{ padding: "20px 24px", borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h3 className="label-caps" style={{ margin: "0 0 4px", fontSize: 13, color: "var(--text-primary)" }}>
                Station Vulnerability Index
              </h3>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Ranking all tracked nodes</div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="font-mono" style={{ fontSize: 14, color: "var(--orange)" }}>
                {hour.toString().padStart(2, '0')}:00
              </span>
              <input 
                type="range" 
                min="5" 
                max="22" 
                value={hour} 
                onChange={(e) => setHour(Number(e.target.value))}
                style={{ cursor: "pointer", accentColor: "var(--orange)", width: 120 }}
              />
            </div>
          </div>

          {/* List */}
          <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12, minHeight: 400, maxHeight: 600, overflowY: "auto" }}>
            {loadingCompare ? (
              <div style={{ color: "var(--text-muted)", fontSize: 12, padding: 20, textAlign: "center" }}>Scanning network...</div>
            ) : (
              rankedLocations.map((loc, idx) => {
                const meta = getLabelForScore(loc.crowd_score);
                const isSelected = selectedStation === loc.location;
                return (
                  <div 
                    key={loc.location}
                    onClick={() => setSelectedStation(loc.location)}
                    style={{
                      display: "flex", alignItems: "center", gap: 16,
                      padding: "10px 14px", borderRadius: 8,
                      background: isSelected ? "rgba(249,115,22,0.1)" : "rgba(255,255,255,0.02)",
                      border: `0.5px solid ${isSelected ? "rgba(249,115,22,0.4)" : "transparent"}`,
                      cursor: "pointer", transition: "all 150ms ease"
                    }}
                  >
                    <div className="font-mono" style={{ fontSize: 12, color: "var(--text-muted)", width: 24 }}>
                      {(idx + 1).toString().padStart(2, '0')}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div className="font-heading" style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                        {loc.location}
                      </div>
                      <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${loc.crowd_score}%`,
                          background: getColorForScore(loc.crowd_score), borderRadius: 2
                        }} />
                      </div>
                    </div>

                    <div style={{ textAlign: "right", minWidth: 48 }}>
                      <div className="font-mono" style={{ fontSize: 16, fontWeight: 700, color: meta.color, lineHeight: 1 }}>
                        {loc.crowd_score}
                      </div>
                      <div className="label-caps" style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4 }}>
                        {meta.label}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN - HEATMAP & NEURAL REASONS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Heatmap Card */}
          <div style={{
            background: "var(--bg-card)", border: "0.5px solid var(--border)",
            borderRadius: 12, padding: "20px 24px"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h3 className="label-caps" style={{ margin: "0 0 4px", fontSize: 13, color: "var(--text-primary)" }}>
                  Temporal Density Heatmap
                </h3>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Target: <strong style={{ color: "var(--orange)" }}>{selectedStation}</strong></div>
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <div style={{ width: 8, height: 8, background: getColorForScore(20), borderRadius: 2 }} />
                <div style={{ width: 8, height: 8, background: getColorForScore(60), borderRadius: 2 }} />
                <div style={{ width: 8, height: 8, background: getColorForScore(80), borderRadius: 2 }} />
                <div style={{ width: 8, height: 8, background: getColorForScore(95), borderRadius: 2 }} />
              </div>
            </div>

            {loadingHeatmap ? (
              <div style={{ color: "var(--text-muted)", fontSize: 12, padding: 40, textAlign: "center" }}>Rendering tensor...</div>
            ) : heatmapData.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: 12, padding: 40, textAlign: "center" }}>No data available</div>
            ) : (
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: `auto repeat(18, 1fr)`,
                gap: 2,
              }}>
                {/* Header row (hours) */}
                <div /> {/* Top left empty cell */}
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className="font-mono" style={{ fontSize: 8, color: "var(--text-muted)", textAlign: "center", marginBottom: 4 }}>
                    {i + 5}
                  </div>
                ))}
                
                {/* Data rows */}
                {DAYS.map((day, dIdx) => (
                  <div style={{ display: "contents" }} key={day}>
                    <div className="font-mono" style={{ fontSize: 9, color: "var(--text-secondary)", display: "flex", alignItems: "center", paddingRight: 8 }}>
                      {day}
                    </div>
                    {Array.from({ length: 18 }).map((_, hIdx) => {
                      const score = heatmapData[dIdx]?.[hIdx] ?? 0;
                      return (
                        <div 
                          key={hIdx} 
                          title={`${day} ${hIdx + 5}:00 - Score: ${score}`}
                          style={{
                            aspectRatio: "1/1",
                            background: getColorForScore(score),
                            borderRadius: 2,
                            opacity: 0.9,
                            cursor: "crosshair"
                          }} 
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Model Info Card */}
          <div style={{
            background: "var(--bg-card)", border: "0.5px solid var(--border)",
            borderRadius: 12, padding: "20px 24px", flex: 1
          }}>
             <h3 className="label-caps" style={{ margin: "0 0 16px", fontSize: 13, color: "var(--text-primary)" }}>
                Global Agentic Feature Importance
             </h3>
             <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {!modelInfo ? (
                  <div className="font-mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>Fetching weights...</div>
                ) : (
                  Object.entries(modelInfo)
                    .sort(([,a], [,b]) => b - a)
                    .map(([feature, weight]) => {
                      const pct = (weight * 100).toFixed(1);
                      return (
                        <div key={feature}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span className="font-mono" style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                              {feature.replace("_", " ")}
                            </span>
                            <span className="font-mono" style={{ fontSize: 11, color: "var(--orange)" }}>{pct}%</span>
                          </div>
                          <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
                            <div style={{
                                height: "100%", width: `${pct}%`,
                                background: `linear-gradient(90deg, var(--orange), #EF4444)`,
                                borderRadius: 2,
                            }} />
                          </div>
                        </div>
                      );
                    })
                )}
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
