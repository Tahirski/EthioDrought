"""Mann-Kendall trend test and Sen's slope.

Method (documented, exact):
  S      = sum_{i<j} sgn(x_j - x_i)
  Var(S) = [n(n-1)(2n+5) - sum_g t_g(t_g-1)(2t_g+5)] / 18      (tie-corrected; ties = exactly equal values)
  Z      = (S-1)/sqrt(Var) if S>0 ; (S+1)/sqrt(Var) if S<0 ; 0 if S==0   (continuity correction)
  p      = two-sided standard-normal tail, computed with erfc (not a polynomial approximation)
This is a NORMAL APPROXIMATION. It is less reliable for n < 10 (flagged in output).
Missing values are dropped; Sen's slope uses the TRUE time index of valid points, so gaps are
not collapsed. Serial correlation is DIAGNOSED (lag-1 on Sen residuals) but NOT corrected.
Statistical significance != environmental importance; a trend is not evidence of causation.
"""
from __future__ import annotations
import math
from collections import Counter
from dataclasses import dataclass, field, asdict
from typing import Optional, Sequence
import numpy as np

from .config import DEFAULT


def _clean(values, times=None):
    t = list(range(len(values))) if times is None else list(times)
    if len(t) != len(values):
        raise ValueError("times and values must have equal length")
    xs, ts = [], []
    for v, ti in zip(values, t):
        if v is None or (isinstance(v, float) and math.isnan(v)):
            continue
        xs.append(float(v)); ts.append(float(ti))
    return xs, ts


def sens_slope(values: Sequence, times=None) -> dict:
    xs, ts = _clean(values, times)
    n = len(xs)
    if n < 2:
        return {"slope": None, "intercept": None, "n_valid": n}
    slopes = [(xs[j] - xs[i]) / (ts[j] - ts[i])
              for i in range(n - 1) for j in range(i + 1, n) if ts[j] != ts[i]]
    slope = float(np.median(slopes))
    intercept = float(np.median(xs) - np.median(ts) * slope)  # same convention as pymannkendall
    return {"slope": slope, "intercept": intercept, "n_valid": n}


@dataclass
class MannKendallResult:
    status: str                      # "ok" | "insufficient_data"
    n_valid: int
    n_total: int
    S: Optional[int] = None
    var_S: Optional[float] = None
    z: Optional[float] = None
    p_value: Optional[float] = None
    tau: Optional[float] = None
    direction_of_S: Optional[str] = None     # sign of S, regardless of significance
    trend: Optional[str] = None              # "increasing" | "decreasing" | "no_significant_trend"
    significant: Optional[bool] = None
    alpha: float = 0.05
    sens_slope: Optional[float] = None
    sens_intercept: Optional[float] = None
    slope_units: Optional[str] = None
    time_units: Optional[str] = None
    method: str = "mann_kendall_normal_approximation_tie_corrected_continuity_corrected"
    lag1_autocorrelation: Optional[float] = None
    warnings: list = field(default_factory=list)

    def to_dict(self):
        return asdict(self)


def mann_kendall(values: Sequence, times=None, alpha: float = DEFAULT.mk_alpha,
                 min_samples: int = DEFAULT.mk_min_samples,
                 value_units: str = "", time_units: str = "time step") -> MannKendallResult:
    n_total = len(values)
    xs, ts = _clean(values, times)
    n = len(xs)
    res = MannKendallResult(status="ok", n_valid=n, n_total=n_total, alpha=alpha,
                            slope_units=f"{value_units}/{time_units}" if value_units else f"1/{time_units}",
                            time_units=time_units)
    if n < max(min_samples, 3):
        res.status = "insufficient_data"
        res.warnings.append(f"n_valid={n} < min_samples={min_samples}; no statistic computed")
        return res
    if n_total - n:
        res.warnings.append(f"{n_total - n} missing observation(s) dropped; Sen's slope uses true time index")

    S = 0
    for i in range(n - 1):
        for j in range(i + 1, n):
            d = xs[j] - xs[i]
            S += (d > 0) - (d < 0)
    ties = sum(t * (t - 1) * (2 * t + 5) for t in Counter(xs).values() if t > 1)
    var = (n * (n - 1) * (2 * n + 5) - ties) / 18.0
    if var <= 0:   # constant series
        z = 0.0
    elif S > 0:
        z = (S - 1) / math.sqrt(var)
    elif S < 0:
        z = (S + 1) / math.sqrt(var)
    else:
        z = 0.0
    p = math.erfc(abs(z) / math.sqrt(2.0))
    res.S, res.var_S, res.z, res.p_value = int(S), var, z, p
    res.tau = S / (n * (n - 1) / 2.0)
    res.direction_of_S = "positive" if S > 0 else "negative" if S < 0 else "none"
    res.significant = bool(p < alpha)
    res.trend = ("increasing" if S > 0 else "decreasing") if res.significant else "no_significant_trend"

    sen = sens_slope(xs, ts)
    res.sens_slope, res.sens_intercept = sen["slope"], sen["intercept"]

    if n < 10:
        res.warnings.append("n < 10: normal approximation is unreliable for small samples")
    if var > 0 and n >= 4:
        resid = np.array(xs) - (sen["intercept"] + sen["slope"] * np.array(ts))
        r = resid - resid.mean()
        denom = float((r ** 2).sum())
        if denom > 0:
            r1 = float((r[:-1] * r[1:]).sum() / denom)
            res.lag1_autocorrelation = r1
            if abs(r1) > 1.96 / math.sqrt(n):
                res.warnings.append("serial correlation detected (lag-1); p-value not corrected and may be overstated")
    return res
