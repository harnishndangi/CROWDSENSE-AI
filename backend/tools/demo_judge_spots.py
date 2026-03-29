"""
Curated public places for judge demos + verified neighbor distances (Haversine only).
LLM prompts must cite distances from here — never invent km or precise minutes.
"""

from __future__ import annotations

from tools.mumbai_context import MUMBAI_LOCATIONS, calculate_distance

# Exact keys in MUMBAI_LOCATIONS — use these strings in UI / tests.
JUDGE_DEMO_LOCATION_NAMES: list[str] = [
    "Dadar Station",
    "Andheri Station",
    "CST / CSMT",
    "Kurla Station",
    "Ghatkopar Station",
    "Thane Station",
    "BKC",
    "Juhu Beach",
    "Siddhivinayak Temple",
    "Gateway of India",
    "Phoenix Palladium",
    "Bandra Station",
]

# Rich, spot-specific copy for AI prompts (personalised, not generic Mumbai text).
SPOT_NARRATIVES: dict[str, str] = {
    "Dadar Station": (
        "WR + CR interchange; heavy footbridge movement between platforms; "
        "Virar/Churchgate and Karjat/Panvel crowds cross here. Peak crowding on FOBs 8:30–10:30 and 18:00–20:30 weekdays."
    ),
    "Andheri Station": (
        "Major WR stop with Metro Line 1 interchange; office and airport traffic; "
        "east–west bridge congestion is the main pinch point vs smaller suburban stations."
    ),
    "CST / CSMT": (
        "Historic CR terminus toward Thane/Panvel; intense platform density at start/end of workday; "
        "connects to Harbour and long-distance — different rush shape than mid-line stations."
    ),
    "Kurla Station": (
        "CR main + Harbour + LTT proximity; industrial belt and east–west transfers; "
        "crowd spikes when Harbour delays stack passengers on connecting platforms."
    ),
    "Ghatkopar Station": (
        "CR + Metro Line 1 interchange; residential east Mumbai; "
        "interchange congestion differs from pure WR line stations like Andheri."
    ),
    "Thane Station": (
        "Major CR hub before Kalyan line branches; long-distance commuter accumulation; "
        "evening northbound pressure is structurally different from South Mumbai termini."
    ),
    "BKC": (
        "Bandra–Kurla office cluster; weekday lunch and 18:00–20:00 road + skywalk pressure; "
        "weekends much quieter than railway cores."
    ),
    "Juhu Beach": (
        "Open sand + promenade; crowds weather- and sunset-driven; "
        "high tide and weekends shift usable space — not comparable to station platform density."
    ),
    "Siddhivinayak Temple": (
        "Queue-driven visits; Tuesday and evening aarti peaks; "
        "crowd is line-based, not train-timetable-based."
    ),
    "Gateway of India": (
        "Ferry hub + tourism; weekend and holiday surges; "
        "boat schedules and events matter more than office rush hours."
    ),
    "Phoenix Palladium": (
        "High-end mall in Lower Parel; evening and weekend peaks; "
        "AC indoor capacity vs outdoor heat/rain shifts behaviour."
    ),
    "Bandra Station": (
        "WR + BKC access; Bandra Terminus long-distance spillover possible; "
        "evening westbound locals toward Virar are a distinct crowding pattern."
    ),
}


def _resolve_key(loc: str | None) -> str | None:
    if not loc:
        return None
    if loc in MUMBAI_LOCATIONS:
        return loc
    low = loc.lower().strip()
    for name in MUMBAI_LOCATIONS:
        if low in name.lower() or name.lower() in low:
            return name
    return None


def get_spot_narrative(loc: str | None) -> str:
    key = _resolve_key(loc)
    if not key:
        return ""
    return SPOT_NARRATIVES.get(key, "")


def get_verified_neighbor_lines(loc: str | None, max_n: int = 4) -> list[str]:
    """Same-category neighbors within 0.5–6 km (Haversine). For prompts and UI."""
    key = _resolve_key(loc)
    if not key or key not in MUMBAI_LOCATIONS:
        return []
    meta = MUMBAI_LOCATIONS[key]
    lat, lon = meta["lat"], meta["lon"]
    typ = meta.get("type")
    rows: list[tuple[float, str]] = []
    for name, m in MUMBAI_LOCATIONS.items():
        if name == key:
            continue
        if m.get("type") != typ:
            continue
        d = calculate_distance(lat, lon, m["lat"], m["lon"])
        if d < 0.4 or d > 6.0:
            continue
        rows.append((d, name))
    rows.sort(key=lambda x: x[0])
    out = []
    for d, nm in rows[:max_n]:
        out.append(f"{nm}: ~{d:.1f} km (straight-line, same category: {typ})")
    return out


def get_verified_cross_mode_lines(loc: str | None, max_n: int = 3) -> list[str]:
    """Nearby places of a different type (e.g. metro near railway) with verified km."""
    key = _resolve_key(loc)
    if not key or key not in MUMBAI_LOCATIONS:
        return []
    meta = MUMBAI_LOCATIONS[key]
    lat, lon = meta["lat"], meta["lon"]
    typ = meta.get("type")
    rows: list[tuple[float, str, str]] = []
    for name, m in MUMBAI_LOCATIONS.items():
        if name == key:
            continue
        if m.get("type") == typ:
            continue
        d = calculate_distance(lat, lon, m["lat"], m["lon"])
        if d < 0.3 or d > 8.0:
            continue
        rows.append((d, name, m.get("type", "?")))
    rows.sort(key=lambda x: x[0])
    return [f"{nm} ({ot}): ~{d:.1f} km" for d, nm, ot in rows[:max_n]]


def get_demo_fallback_suggestions(
    loc: str | None,
    loc_type: str,
    pred: str,
    hour: int,
    is_weekend: int,
) -> list[str]:
    """No invented % or km — qualitative + references to verified neighbors only."""
    key = _resolve_key(loc) or loc or "this place"
    neighbors = get_verified_neighbor_lines(loc, max_n=2)
    cross = get_verified_cross_mode_lines(loc, max_n=1)
    ntxt = "; ".join(neighbors) if neighbors else "see registry for nearby hubs"
    ctx = "; ".join(cross) if cross else ""

    lines: list[str] = []
    if loc_type in ("railway", "metro", "transit_hub") and pred in ("High", "Very High"):
        lines.append(
            f"1️⃣ {key}: avoid 8:30–10:30 and 18:00–20:30 on weekdays if possible — "
            f"use slow trains or off-peak slots when platforms are thinner (typical Mumbai local pattern)."
        )
        if neighbors:
            lines.append(f"2️⃣ Verified nearby (straight-line): {ntxt}. Compare crowd before detouring.")
        else:
            lines.append(
                "2️⃣ Check app map for same-line alternatives; we only show distances computed from coordinates."
            )
    elif loc_type in ("beach", "tourism"):
        lines.append(
            f"1️⃣ {key}: prefer weekday mornings or post-sunset weekdays for lighter crowds; "
            f"weekend afternoons are usually busiest."
        )
        if ctx:
            lines.append(f"2️⃣ Other options (verified distance): {ctx}")
    elif loc_type in ("religious",):
        lines.append(
            f"1️⃣ {key}: non-festival weekdays after opening often have shorter queues than Tue/evening peaks."
        )
    elif loc_type in ("mall", "market"):
        lines.append(
            f"1️⃣ {key}: weekday lunch hours beat Saturday evening for shopping density; "
            f"rain pushes crowds indoors — expect more congestion in covered malls."
        )
    else:
        lines.append(
            f"1️⃣ {key}: match visit time to place type — transit peaks follow commute hours; "
            f"leisure spots follow weekends and weather."
        )

    if len(lines) < 2:
        lines.append(
            "2️⃣ Use Live Map + compare tool in the app for same-hour ranks across zones "
            "(no fixed km travel time — road conditions vary)."
        )
    return lines[:4]
