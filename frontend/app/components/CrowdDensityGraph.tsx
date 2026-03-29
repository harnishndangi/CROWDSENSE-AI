"use client";

import { useState, useEffect, useRef } from "react";

interface LocationDensity {
  name: string;
  density: number; // 0-100 crowd density score
  type: string; // railway, metro, bus, etc.
  predicted?: boolean;
}

interface CrowdDensityGraphProps {
  title?: string;
  subtitle?: string;
  locations?: LocationDensity[];
  maxBars?: number;
}

// Default Mumbai locations with varying crowd densities
const DEFAULT_LOCATIONS: LocationDensity[] = [
  { name: "Dadar Station", density: 87, type: "railway", predicted: true },
  { name: "Andheri Station", density: 72, type: "railway", predicted: true },
  { name: "CST / CSMT", density: 65, type: "railway", predicted: true },
  { name: "Borivali Station", density: 58, type: "railway", predicted: true },
  { name: "Thane Station", density: 81, type: "railway", predicted: true },
  { name: "Kurla Station", density: 45, type: "railway", predicted: true },
  { name: "Ghatkopar Metro", density: 38, type: "metro", predicted: true },
  { name: "BKC", density: 42, type: "metro", predicted: true },
];

function getDensityColor(density: number): string {
  if (density >= 80) return "#EF4444"; // Critical - Red
  if (density >= 60) return "#F97316"; // High - Orange
  if (density >= 40) return "#FDE047"; // Moderate - Yellow
  return "#22C55E"; // Low - Green
}

function getDensityLabel(density: number): string {
  if (density >= 80) return "CRITICAL";
  if (density >= 60) return "HIGH";
  if (density >= 40) return "MODERATE";
  return "LOW";
}

export default function CrowdDensityGraph({
  title = "Crowd Density by Location",
  subtitle = "Live predictions with numerical crowd scores",
  locations = DEFAULT_LOCATIONS,
  maxBars = 8,
}: CrowdDensityGraphProps) {
  const [animated, setAnimated] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sort by density descending and limit to maxBars
  const displayLocations = [...locations]
    .sort((a, b) => b.density - a.density)
    .slice(0, maxBars);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setAnimated(true), 100);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const maxDensity = Math.max(...displayLocations.map((l) => l.density), 100);

  return (
    <div
      ref={containerRef}
      style={{
        background: "#111",
        border: "1px solid #1e1e1e",
        padding: "28px",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-condensed)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#555",
              marginBottom: 6,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 24,
                height: 2,
                background: "#555",
                display: "inline-block",
              }}
            />
            Crowd Density Visualization
          </div>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 20,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "#666",
              marginTop: 4,
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { label: "Critical (80-100%)", color: "#EF4444" },
            { label: "High (60-79%)", color: "#F97316" },
            { label: "Moderate (40-59%)", color: "#FDE047" },
            { label: "Low (0-39%)", color: "#22C55E" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  background: item.color,
                  borderRadius: 2,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-condensed)",
                  fontSize: 10,
                  color: "#555",
                  letterSpacing: "0.06em",
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Graph Bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {displayLocations.map((location, index) => {
          const color = getDensityColor(location.density);
          const label = getDensityLabel(location.density);
          const barWidth = animated
            ? `${(location.density / maxDensity) * 100}%`
            : "0%";

          return (
            <div
              key={location.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Location Name */}
              <div
                style={{
                  width: 140,
                  flexShrink: 0,
                  fontFamily: "var(--font-heading)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: hoveredIndex === index ? "#fff" : "#aaa",
                  transition: "color 0.2s",
                }}
              >
                {location.name}
              </div>

              {/* Bar Container */}
              <div style={{ flex: 1, position: "relative" }}>
                {/* Background track */}
                <div
                  style={{
                    height: 28,
                    background: "#1a1a1a",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  {/* Animated bar */}
                  <div
                    style={{
                      height: "100%",
                      width: barWidth,
                      background: color,
                      borderRadius: 2,
                      transition: `width 0.8s cubic-bezier(0, 0, 0.2, 1) ${index * 80}ms`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      paddingRight: 8,
                    }}
                  >
                    {/* Density value inside bar */}
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        fontWeight: 700,
                        color: location.density > 50 ? "#000" : "#fff",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {location.density}%
                    </span>
                  </div>
                </div>

                {/* Tooltip on hover */}
                {hoveredIndex === index && (
                  <div
                    style={{
                      position: "absolute",
                      top: -40,
                      left: barWidth,
                      transform: "translateX(-50%)",
                      background: "#222",
                      border: "1px solid #333",
                      padding: "8px 12px",
                      borderRadius: 4,
                      zIndex: 10,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#fff",
                      }}
                    >
                      {location.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: color,
                      }}
                    >
                      {label} · {location.density}% density
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-condensed)",
                        fontSize: 9,
                        color: "#666",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginTop: 2,
                      }}
                    >
                      {location.type}
                      {location.predicted ? " · AI Predicted" : ""}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Label */}
              <div
                style={{
                  width: 80,
                  textAlign: "right",
                  fontFamily: "var(--font-condensed)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: color,
                  textTransform: "uppercase",
                }}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 16,
          marginTop: 28,
          paddingTop: 20,
          borderTop: "1px solid #1e1e1e",
        }}
      >
        {[
          {
            label: "Average Density",
            value: `${Math.round(
              displayLocations.reduce((a, b) => a + b.density, 0) /
                displayLocations.length
            )}%`,
            color: "#aaa",
          },
          {
            label: "Highest",
            value: `${Math.max(...displayLocations.map((l) => l.density))}%`,
            color: "#EF4444",
          },
          {
            label: "Lowest",
            value: `${Math.min(...displayLocations.map((l) => l.density))}%`,
            color: "#22C55E",
          },
          {
            label: "Critical Zones",
            value: displayLocations.filter((l) => l.density >= 80).length,
            color:
              displayLocations.filter((l) => l.density >= 80).length > 0
                ? "#EF4444"
                : "#22C55E",
          },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 24,
                fontWeight: 800,
                color: stat.color,
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontFamily: "var(--font-condensed)",
                fontSize: 9,
                color: "#555",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Note */}
      <div
        style={{
          marginTop: 16,
          padding: "12px 16px",
          background: "rgba(34, 197, 94, 0.05)",
          border: "1px solid rgba(34, 197, 94, 0.15)",
          borderRadius: 2,
          fontFamily: "var(--font-body)",
          fontSize: 12,
          color: "#666",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ color: "#22C55E" }}>●</span>
        Values are AI-predicted crowd density scores (0-100%) based on real-time
        signals including weather, traffic, events, and historical patterns.
      </div>
    </div>
  );
}
