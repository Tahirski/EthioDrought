import math, random
import numpy as np, pytest, pymannkendall as pmk
from scipy import stats as sps
from app.science.stats import mann_kendall, sens_slope

NAN = float("nan")


def test_strictly_increasing_hand_computed():
    r = mann_kendall(list(range(1, 11)))
    assert r.S == 45 and r.var_S == pytest.approx(125.0)            # 10*9*25/18
    assert r.z == pytest.approx(44 / math.sqrt(125))                 # (S-1)/sqrt(var)
    assert r.p_value == pytest.approx(2 * sps.norm.sf(r.z), rel=1e-12)
    assert r.trend == "increasing" and r.tau == pytest.approx(1.0)
    assert r.sens_slope == pytest.approx(1.0)


def test_strictly_decreasing():
    r = mann_kendall([10 - i * 0.5 for i in range(12)])
    assert r.S == -66 and r.trend == "decreasing" and r.sens_slope == pytest.approx(-0.5)


def test_constant_series():
    r = mann_kendall([3.0] * 10)
    assert r.S == 0 and r.z == 0 and r.p_value == 1.0 and r.trend == "no_significant_trend" and r.sens_slope == 0


def test_ties_match_hand_calc():
    x = [1, 2, 2, 3, 3, 3, 4, 5, 5, 6]
    r = mann_kendall(x)
    ties = 2 * 1 * 9 + 3 * 2 * 11 + 2 * 1 * 9                        # groups of 2,3,2
    assert r.var_S == pytest.approx((10 * 9 * 25 - ties) / 18)


@pytest.mark.parametrize("seed", range(8))
def test_random_matches_pymannkendall(seed):
    rng = np.random.default_rng(seed)
    x = rng.normal(size=30) + 0.03 * np.arange(30)
    r, ref = mann_kendall(list(x)), pmk.original_test(x)
    assert r.S == ref.s and r.var_S == pytest.approx(ref.var_s)
    assert r.z == pytest.approx(ref.z) and r.p_value == pytest.approx(ref.p, rel=1e-9)
    assert r.sens_slope == pytest.approx(ref.slope) and r.sens_intercept == pytest.approx(ref.intercept)
    assert r.trend == ref.trend.replace("no trend", "no_significant_trend")


def test_tied_data_matches_pymannkendall():
    x = [random.Random(1).choice([1, 2, 3, 4]) for _ in range(25)]
    x = [float(v) for v in np.random.default_rng(3).integers(1, 5, 25)]
    r, ref = mann_kendall(x), pmk.original_test(x)
    assert (r.S, r.var_S) == (ref.s, pytest.approx(ref.var_s)) and r.z == pytest.approx(ref.z)


def test_missing_values_keep_true_time_index():
    # y = 2t with t=2 missing: Sen slope must stay exactly 2 (no collapsing of the gap)
    x = [0, 2, NAN, 6, 8, 10, 12, 14, 16, 18]
    r = mann_kendall(x)
    assert r.n_valid == 9 and r.n_total == 10 and r.sens_slope == pytest.approx(2.0)
    assert any("missing" in w for w in r.warnings)
    assert sens_slope([0, 2, None, 6])["slope"] == pytest.approx(2.0)


def test_small_sample_is_refused_not_computed():
    r = mann_kendall([1, 2, 3, 4])
    assert r.status == "insufficient_data" and r.S is None and r.p_value is None
    assert mann_kendall([1, 2, 3, 4], min_samples=4).status == "ok"
    assert mann_kendall([1, 2, NAN, NAN, 5, 6, NAN, NAN, 9, 10]).status == "insufficient_data"  # 6 valid < 8


def test_small_sample_warning_and_units():
    r = mann_kendall(list(range(8)), value_units="mm", time_units="month")
    assert any("n < 10" in w for w in r.warnings) and r.slope_units == "mm/month"


def test_serial_correlation_flagged():
    x = np.cumsum(np.random.default_rng(0).normal(size=40))          # random walk: strong autocorrelation
    r = mann_kendall(list(x))
    assert any("serial correlation" in w for w in r.warnings)
