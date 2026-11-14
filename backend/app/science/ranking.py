"""Regional Environmental Investigation Priority. Transparent, configurable; NOT a humanitarian
needs assessment or government risk classification. Missing data is never treated as normal:
regions without enough valid indicators are listed as 'insufficient data' and left unranked."""
from __future__ import annotations
from dataclasses import dataclass
from .config import DEFAULT, ScienceConfig
from .fingerprint import INDICATORS

LABEL = "Environmental Investigation Priority"


@dataclass(frozen=True)
class RankingConfig:
    w_stress_count: float = 0.35
    w_magnitude: float = 0.30
    w_persistence: float = 0.20
    w_trend: float = 0.15
    magnitude_cap_z: float = 3.0
    persistence_window: int = 6
    min_indicators: int = 2
    high: float = 60.0
    moderate: float = 30.0


def _persistence(series, thr):
    n = 0
    for p in sorted(series, reverse=True):
        z = series[p]
        if z is not None and z <= thr: n += 1
        else: break
    return n


def score_region(series: dict, period: str, cfg: ScienceConfig = DEFAULT, rc: RankingConfig = RankingConfig()) -> dict:
    zs = {n: series.get(n, {}).get(period) for n in INDICATORS}
    avail = {n: z for n, z in zs.items() if z is not None and z == z}
    base = {"label": LABEL, "observation_period": period, "indicators_available": sorted(avail),
            "indicators_missing": [n for n in INDICATORS if n not in avail]}
    if len(avail) < rc.min_indicators:
        return {**base, "score": None, "level": "insufficient_data",
                "reason": f"fewer than {rc.min_indicators} indicators have valid observations"}
    stressed = [n for n, z in avail.items() if z <= cfg.stress_z]
    stress_frac = len(stressed) / len(avail)
    mag = sum(min(-z, rc.magnitude_cap_z) for z in avail.values() if z < 0) / (len(avail) * rc.magnitude_cap_z)
    persist = max((_persistence(series.get(n, {}), cfg.stress_z) for n in avail), default=0)
    persist_n = min(persist, rc.persistence_window) / rc.persistence_window
    from .fingerprint import _direction
    dirs = {n: _direction(series.get(n, {}), period, cfg) for n in avail}
    trend = 0.5 * sum((d == "declining") - (d == "improving") for d in dirs.values()) / len(avail) + 0.5   # 0..1
    score = 100 * (rc.w_stress_count * stress_frac + rc.w_magnitude * mag +
                   rc.w_persistence * persist_n + rc.w_trend * trend)
    level = "higher_priority" if score >= rc.high else "moderate_priority" if score >= rc.moderate else "routine_monitoring"
    return {**base, "score": round(score, 2), "level": level, "stressed_indicators": stressed,
            "components": {"stress_fraction": stress_frac, "magnitude": mag, "persistence_months": persist, "trend_term": trend,
                           "trend_directions": dirs},
            "weights": {"stress_count": rc.w_stress_count, "magnitude": rc.w_magnitude,
                        "persistence": rc.w_persistence, "trend": rc.w_trend}}


def rank_regions(regions: dict, period: str, cfg: ScienceConfig = DEFAULT, rc: RankingConfig = RankingConfig()) -> list:
    rows = [{"region_id": rid, **score_region(s, period, cfg, rc)} for rid, s in regions.items()]
    ranked = sorted([r for r in rows if r["score"] is not None], key=lambda r: -r["score"])
    for i, r in enumerate(ranked, 1): r["rank"] = i
    unranked = [{**r, "rank": None} for r in rows if r["score"] is None]
    return ranked + unranked
