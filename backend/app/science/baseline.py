"""Historical calendar-period baselines (same calendar month across baseline years)."""
from __future__ import annotations
from dataclasses import dataclass, asdict, field
from typing import Optional, Sequence
import numpy as np
from .config import DEFAULT, ScienceConfig

PERCENTILES = (10, 25, 50, 75, 90)


@dataclass
class Baseline:
    month: int
    baseline_period: str
    method: str
    valid_count: int
    missing_count: int
    reliable: bool
    reason: Optional[str] = None
    mean: Optional[float] = None
    median: Optional[float] = None
    std: Optional[float] = None           # sample std (ddof=1)
    percentiles: dict = field(default_factory=dict)
    values: tuple = ()                    # retained for empirical percentile / provenance

    def to_dict(self, include_values=False):
        d = asdict(self)
        if not include_values:
            d.pop("values")
        return d


def build_baselines(observations: Sequence[tuple], cfg: ScienceConfig = DEFAULT,
                    start_year: Optional[int] = None, end_year: Optional[int] = None) -> dict:
    """observations: iterable of (year, month, value-or-None). Missing is NEVER treated as zero."""
    y0 = start_year or cfg.baseline_start_year
    y1 = end_year or cfg.baseline_end_year
    n_years = y1 - y0 + 1
    by_month = {m: [] for m in range(1, 13)}
    for y, m, v in observations:
        if y0 <= y <= y1 and v is not None and v == v:
            by_month[m].append(float(v))
    out = {}
    for m, vals in by_month.items():
        valid = len(vals)
        b = Baseline(month=m, baseline_period=f"{y0}-{y1}",
                     method="calendar-month climatology; sample std ddof=1; linear-interpolated percentiles",
                     valid_count=valid, missing_count=n_years - valid, reliable=False)
        if valid < cfg.min_baseline_valid:
            b.reason = f"only {valid} valid observations; need >= {cfg.min_baseline_valid}"
        else:
            arr = np.array(vals)
            b.mean, b.median = float(arr.mean()), float(np.median(arr))
            b.std = float(arr.std(ddof=1))
            b.percentiles = {f"p{p}": float(np.percentile(arr, p)) for p in PERCENTILES}
            b.values = tuple(sorted(vals))
            b.reliable = True
        out[m] = b
    return out
