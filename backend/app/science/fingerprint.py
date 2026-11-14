"""Drought Fingerprint Engine.

Input: z-score series (positive = wetter/greener, negative = drier/less green) per indicator:
    {"rainfall": {"2024-09": -0.2, ...}, "soil_moisture": {...}, "vegetation": {...}}
Individual indicators are ALWAYS returned; patterns and the composite are additions, never replacements.
Interpretations are descriptive of satellite-derived anomalies only. They make no claim about
crops, livestock, groundwater or causation, and are NOT official drought classifications.
"""
from __future__ import annotations
from typing import Optional
from .config import DEFAULT, ScienceConfig
from .stats import sens_slope

INDICATORS = ("rainfall", "soil_moisture", "vegetation")
LIMITATIONS = [
    "Anomalies are relative to a configurable historical baseline; thresholds are experimental project conventions.",
    "Rainfall, soil moisture and NDVI differ in resolution and respond with different lags; they are not interchangeable.",
    "Satellite-derived anomalies do not directly measure crop loss, livestock condition or groundwater.",
]


def _status(z, cfg):
    if z is None: return "insufficient_data"
    if z <= cfg.stress_z: return "stressed"
    if z >= -cfg.stress_z: return "above_normal"
    return "near_normal"


def _window(series, period, n):
    periods = sorted(p for p in series if p <= period)[-n:]
    return [(p, series[p]) for p in periods]


def _direction(series, period, cfg):
    w = _window(series, period, cfg.trend_window)
    vals = [z for _, z in w if z is not None]
    if len(w) < cfg.trend_window or len(vals) < cfg.trend_window:
        return None
    slope = sens_slope(vals)["slope"]
    delta = vals[-1] - vals[0]
    if slope > 0 and delta >= cfg.improve_delta_z: return "improving"
    if slope < 0 and delta <= -cfg.improve_delta_z: return "declining"
    return "steady"


def composite_index(z_r, z_s, z_v, cfg: ScienceConfig = DEFAULT, weights=None) -> Optional[float]:
    """EXPERIMENTAL D = 0.35 Zr + 0.35 Zs + 0.30 Zv. Returns None if ANY component is missing."""
    if None in (z_r, z_s, z_v): return None
    w = weights or cfg.composite_weights
    return w[0] * z_r + w[1] * z_s + w[2] * z_v


def composite_sensitivity(z_r, z_s, z_v, delta=0.1, cfg: ScienceConfig = DEFAULT) -> Optional[dict]:
    base = composite_index(z_r, z_s, z_v, cfg)
    if base is None: return None
    outs = []
    for i in range(3):
        for sgn in (-1, 1):
            w = list(cfg.composite_weights); w[i] += sgn * delta
            s = sum(w); w = [x / s for x in w]                      # renormalise to sum 1
            outs.append(composite_index(z_r, z_s, z_v, cfg, tuple(w)))
    return {"base": base, "min": min(outs), "max": max(outs),
            "note": f"weights perturbed by +/-{delta} then renormalised"}


def evaluate_fingerprint(series: dict, period: Optional[str] = None, cfg: ScienceConfig = DEFAULT) -> dict:
    all_periods = sorted({p for s in series.values() for p in s})
    if not all_periods:
        return {"period": None, "indicators": {}, "patterns": [], "composite": None, "data_quality": "Insufficient data",
                "limitations": LIMITATIONS}
    period = period or all_periods[-1]
    ind = {}
    for name in INDICATORS:
        s = series.get(name, {})
        z = s.get(period)
        z = None if z is None or z != z else z
        ind[name] = {"z": z, "status": _status(z, cfg), "direction": _direction(s, period, cfg) if z is not None else None,
                     "observation_period": period, "units": "standardized anomaly (z, unitless)"}
    avail = [n for n in INDICATORS if ind[n]["z"] is not None]
    stressed = [n for n in avail if ind[n]["status"] == "stressed"]
    improving = [n for n in avail if ind[n]["direction"] == "improving"]
    declining = [n for n in avail if ind[n]["direction"] == "declining"]
    patterns = []

    def add(ptype, involved, interp):
        patterns.append({"pattern_type": ptype, "indicators_involved": involved, "observation_period": period,
                         "supporting_observations": {n: {"z": ind[n]["z"], "status": ind[n]["status"],
                                                          "direction": ind[n]["direction"]} for n in involved},
                         "interpretation": interp, "limitations": LIMITATIONS,
                         "data_quality": "Good data coverage" if len(avail) == 3 else "Partial data coverage"})

    if len(stressed) >= 2:
        add("multiple_indicators_negative", stressed,
            "Two or more indicators are at or below the experimental stress threshold in the same period.")
    rain_up = "rainfall" in improving
    if rain_up and "soil_moisture" in stressed:
        add("rainfall_improving_soil_moisture_stressed", ["rainfall", "soil_moisture"],
            "Rainfall anomaly is rising while soil moisture anomaly remains at/below the stress threshold.")
    if rain_up and "vegetation" in stressed:
        add("rainfall_improving_vegetation_stressed", ["rainfall", "vegetation"],
            "Rainfall anomaly is rising while NDVI anomaly remains at/below the stress threshold.")
    if "soil_moisture" in declining and "rainfall" in avail and ind["rainfall"]["status"] != "stressed":
        add("soil_moisture_declining_despite_normal_rainfall", ["soil_moisture", "rainfall"],
            "Soil moisture anomaly is falling while the rainfall anomaly is not at the stress threshold.")
    if "vegetation" in declining and rain_up:
        add("vegetation_deteriorating_despite_rainfall_improvement", ["vegetation", "rainfall"],
            "NDVI anomaly is falling while rainfall anomaly is rising.")
    if len(improving) >= 2 and not stressed:
        add("multiple_indicators_recovering", improving,
            "Two or more indicators show rising anomalies and none is currently at/below the stress threshold.")

    comp = composite_index(*(ind[n]["z"] for n in INDICATORS), cfg)
    n_valid = len(avail)
    return {
        "period": period, "indicators": ind, "patterns": patterns,
        "composite": ({"value": comp, "label": "Experimental composite (not an official drought classification)",
                       "formula": "D = 0.35*Zr + 0.35*Zs + 0.30*Zv",
                       "sensitivity": composite_sensitivity(*(ind[n]["z"] for n in INDICATORS), cfg=cfg)}
                      if comp is not None else
                      {"value": None, "reason": "withheld: one or more indicators missing for this period"}),
        "data_quality": {3: "Good data coverage", 2: "Partial data coverage", 1: "Limited data"}.get(n_valid, "Insufficient data"),
        "thresholds": {"stress_z": cfg.stress_z, "improve_delta_z": cfg.improve_delta_z, "trend_window": cfg.trend_window,
                       "status": "experimental"},
        "limitations": LIMITATIONS,
    }
