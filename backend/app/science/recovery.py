"""Environmental recovery analysis (anomaly-based only). Does NOT imply livestock, crop,
household or community recovery."""
from __future__ import annotations
from typing import Optional
from .config import DEFAULT, ScienceConfig
from .fingerprint import INDICATORS

STATUSES = ("recovery_across_indicators", "partial_recovery", "incomplete_recovery",
            "persistent_environmental_stress", "no_stress_episode", "insufficient_data")


def _indicator(series: dict, cfg, min_valid):
    periods = sorted(series)
    vals = [(p, series[p]) for p in periods]
    valid = [(p, z) for p, z in vals if z is not None and z == z]
    missing = len(vals) - len(valid)
    if len(valid) < min_valid or vals[-1][1] is None:
        return {"status": "insufficient_data", "valid": len(valid), "missing": missing}
    stressed = [(p, z) for p, z in valid if z <= cfg.stress_z]
    latest_p, latest_z = vals[-1]
    base = {"valid": len(valid), "missing": missing, "latest_period": latest_p,
            "remaining_anomaly_z": latest_z}
    if not stressed:
        return {**base, "status": "no_stress_episode"}
    trough_p, trough_z = min(stressed, key=lambda t: t[1])
    after = [(p, z) for p, z in vals if p > trough_p]
    rec_start = None
    run = 0
    for p, z in after:
        if z is not None and z >= cfg.recovery_z:
            run += 1
            if run == 1: cand = p
            if run >= cfg.recovery_sustain_months:
                rec_start = cand; break
        else:
            run = 0       # a missing value breaks the run: gaps are not assumed recovered
    out = {**base, "status": "recovered" if rec_start else "not_recovered",
           "initial_anomaly_z": trough_z, "trough_period": trough_p, "recovery_start": rec_start}
    if rec_start:
        out["recovery_duration_months"] = _months(trough_p, rec_start)
    return out


def _months(a, b):
    return (int(b[:4]) - int(a[:4])) * 12 + int(b[5:7]) - int(a[5:7])


def evaluate_recovery(series: dict, cfg: ScienceConfig = DEFAULT, min_valid: int = 6) -> dict:
    per = {n: _indicator(series.get(n, {}), cfg, min_valid) if series.get(n) else {"status": "insufficient_data", "valid": 0, "missing": 0}
           for n in INDICATORS}
    defs = {"stress": f"z <= {cfg.stress_z}", "recovered": f"z >= {cfg.recovery_z} for {cfg.recovery_sustain_months} consecutive valid months after the trough",
            "note": "experimental project definitions; not official classifications"}
    if any(v["status"] == "insufficient_data" for v in per.values()):
        status = "insufficient_data"
    else:
        S = [n for n, v in per.items() if v["status"] in ("recovered", "not_recovered")]
        R = [n for n in S if per[n]["status"] == "recovered"]
        if not S: status = "no_stress_episode"
        elif per["rainfall"]["status"] == "not_recovered": status = "persistent_environmental_stress"
        elif len(R) == len(S): status = "recovery_across_indicators"
        elif R and "rainfall" in S: status = "partial_recovery" if len(R) > 1 else "incomplete_recovery"
        elif R: status = "partial_recovery"
        else: status = "incomplete_recovery" if "rainfall" in S else "persistent_environmental_stress"
    return {"status": status, "indicators": per, "definitions": defs,
            "limitations": ["Recovery is defined on satellite-derived anomalies only; it does not show recovery of livestock, crops, households or communities.",
                            "Missing observations break a recovery run and are never assumed normal."]}
