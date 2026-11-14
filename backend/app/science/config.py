"""Configurable scientific parameters. Every threshold here is a *project convention*
(experimental), not an official drought classification."""
from dataclasses import dataclass, field


@dataclass(frozen=True)
class ScienceConfig:
    baseline_start_year: int = 2000
    baseline_end_year: int = 2020
    min_baseline_valid: int = 10          # min valid years per calendar month for a baseline
    rainfall_near_zero_mm: float = 1.0    # baselines below this give no % anomaly
    stress_z: float = -1.0                # z <= this => "stressed" (experimental)
    recovery_z: float = -0.5              # z >= this => "recovered" (experimental)
    recovery_sustain_months: int = 2
    trend_window: int = 3                 # months for improving/declining detection
    improve_delta_z: float = 0.5
    mk_min_samples: int = 8
    mk_alpha: float = 0.05
    composite_weights: tuple = (0.35, 0.35, 0.30)   # rain, soil, veg (experimental)
    ndvi_accept_qa: tuple = (0,)          # MOD13A2 SummaryQA values accepted (0 = good)
    coverage_good: float = 0.90
    coverage_partial: float = 0.70
    coverage_limited: float = 0.40


DEFAULT = ScienceConfig()
