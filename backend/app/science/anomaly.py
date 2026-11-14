"""Anomaly calculations. Original values and anomalies are returned separately; every result
carries units and a reason when it cannot be computed."""
from __future__ import annotations
from dataclasses import dataclass, asdict
from typing import Optional
from .baseline import Baseline
from .config import DEFAULT, ScienceConfig

MODIS_NDVI_SCALE = 0.0001
MODIS_NDVI_FILL = -3000
MODIS_NDVI_VALID = (-2000, 10000)


@dataclass
class Anomaly:
    kind: str
    observed: Optional[float]
    units: str
    baseline_mean: Optional[float] = None
    departure: Optional[float] = None
    departure_units: Optional[str] = None
    percent_anomaly: Optional[float] = None
    z: Optional[float] = None
    percentile: Optional[float] = None
    status: str = "ok"
    reason: Optional[str] = None

    def to_dict(self):
        return asdict(self)


def _unusable(kind, obs, units, reason, status="insufficient_data"):
    return Anomaly(kind=kind, observed=obs, units=units, status=status, reason=reason)


def _common(kind, obs, units, b: Optional[Baseline]):
    if obs is None or obs != obs:
        return None, _unusable(kind, None, units, "no valid observation (missing is not treated as zero/normal)")
    if b is None or not b.reliable:
        return None, _unusable(kind, obs, units, (b.reason if b else "no baseline"))
    return b, None


def _z(dep, b):
    return None if not b.std else dep / b.std


def _pct_rank(obs, b):
    """Empirical percentile: % of baseline values <= observed."""
    return 100.0 * sum(1 for v in b.values if v <= obs) / len(b.values)


def rainfall_anomaly(obs, b: Optional[Baseline], cfg: ScienceConfig = DEFAULT) -> Anomaly:
    b, err = _common("rainfall", obs, "mm", b)
    if err: return err
    dep = obs - b.mean
    a = Anomaly("rainfall", obs, "mm", b.mean, dep, "mm", z=_z(dep, b), percentile=_pct_rank(obs, b))
    if b.mean < cfg.rainfall_near_zero_mm:
        a.reason = f"baseline mean {b.mean:.3f} mm < {cfg.rainfall_near_zero_mm} mm: percent anomaly undefined"
    else:
        a.percent_anomaly = dep / b.mean * 100.0      # A_r = (R - Rbar)/Rbar * 100
    return a


def soil_moisture_anomaly(obs, b: Optional[Baseline], units: str = "m3/m3") -> Anomaly:
    b, err = _common("soil_moisture", obs, units, b)
    if err: return err
    dep = obs - b.mean
    return Anomaly("soil_moisture", obs, units, b.mean, dep, units, z=_z(dep, b), percentile=_pct_rank(obs, b))


def ndvi_anomaly(obs, b: Optional[Baseline]) -> Anomaly:
    b, err = _common("vegetation", obs, "NDVI (unitless)", b)
    if err: return err
    dep = obs - b.mean                                   # A_v = NDVI_obs - NDVI_baseline
    return Anomaly("vegetation", obs, "NDVI (unitless)", b.mean, dep, "NDVI units", z=_z(dep, b),
                   percentile=_pct_rank(obs, b))


def modis_ndvi_decode(raw, summary_qa, cfg: ScienceConfig = DEFAULT):
    """MOD13A2 1km NDVI: scale 0.0001, fill -3000, valid range -2000..10000, and SummaryQA screening.
    Returns (ndvi or None, reason or None). Poor-quality pixels are NOT used as valid measurements."""
    if raw is None or raw == MODIS_NDVI_FILL:
        return None, "fill value"
    if not (MODIS_NDVI_VALID[0] <= raw <= MODIS_NDVI_VALID[1]):
        return None, "outside valid range"
    if summary_qa not in cfg.ndvi_accept_qa:
        return None, f"SummaryQA={summary_qa} not accepted"
    return raw * MODIS_NDVI_SCALE, None
