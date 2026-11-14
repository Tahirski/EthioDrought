"""Data-quality classification. Thresholds are project conventions (configurable); no confidence
percentages are invented -- only observed valid/expected counts are reported."""
from .config import DEFAULT, ScienceConfig


def coverage_label(valid: int, expected: int, cfg: ScienceConfig = DEFAULT) -> str:
    if expected <= 0 or valid <= 0:
        return "Insufficient data"
    frac = valid / expected
    if frac >= cfg.coverage_good:
        return "Good data coverage"
    if frac >= cfg.coverage_partial:
        return "Partial data coverage"
    if frac >= cfg.coverage_limited:
        return "Limited data"
    return "Insufficient data"


def coverage_summary(values, cfg: ScienceConfig = DEFAULT) -> dict:
    expected = len(values)
    valid = sum(1 for v in values if v is not None and v == v)
    return {"valid_count": valid, "missing_count": expected - valid, "expected_count": expected,
            "label": coverage_label(valid, expected, cfg)}
