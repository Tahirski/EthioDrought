import pytest
from app.science.baseline import build_baselines
from app.science.anomaly import rainfall_anomaly, soil_moisture_anomaly, ndvi_anomaly, modis_ndvi_decode
from app.science.quality import coverage_label, coverage_summary
from app.science.fingerprint import evaluate_fingerprint, composite_index
from app.science.recovery import evaluate_recovery
from app.science.ranking import rank_regions

YEARS = range(2000, 2021)


def obs(fn, month=1, drop=()):
    return [(y, month, None if y in drop else fn(y)) for y in YEARS]


def test_baseline_hand_computed():
    b = build_baselines(obs(lambda y: float(y - 1999)))[1]          # values 1..21
    assert b.reliable and b.valid_count == 21 and b.missing_count == 0
    assert b.mean == pytest.approx(11.0) and b.median == pytest.approx(11.0)
    assert b.std == pytest.approx(6.2048368229954285)               # sqrt(770/20) = sqrt(38.5)
    assert b.percentiles["p50"] == pytest.approx(11.0)


def test_baseline_std_independent():
    import statistics
    v = [float(y - 1999) for y in YEARS]
    assert build_baselines(obs(lambda y: float(y - 1999)))[1].std == pytest.approx(statistics.stdev(v))


def test_baseline_insufficient_not_computed_and_missing_not_zero():
    b = build_baselines(obs(lambda y: 10.0, drop=set(range(2000, 2013))))[1]   # only 8 valid
    assert not b.reliable and b.mean is None and b.missing_count == 13 and "need >=" in b.reason
    b2 = build_baselines(obs(lambda y: 10.0, drop={2005, 2006}))[1]
    assert b2.mean == pytest.approx(10.0)                           # missing years did not drag mean toward 0


def test_baseline_other_months_empty():
    assert not build_baselines(obs(lambda y: 1.0))[2].reliable


def b_of(fn, month=1): return build_baselines(obs(fn, month))[month]


def test_rainfall_anomaly_formula():
    b = b_of(lambda y: 100.0 + (y - 2010))                          # mean 100
    a = rainfall_anomaly(60.0, b)
    assert a.percent_anomaly == pytest.approx(-40.0) and a.departure == pytest.approx(-40.0) and a.units == "mm"
    assert a.z == pytest.approx(-40.0 / b.std)


def test_rainfall_near_zero_baseline_safe():
    b = b_of(lambda y: 0.0 + (0.001 if y % 2 else 0))
    a = rainfall_anomaly(5.0, b)
    assert a.percent_anomaly is None and "undefined" in a.reason


def test_missing_observation_is_not_zero_anomaly():
    b = b_of(lambda y: 100.0 + (y - 2010))
    a = rainfall_anomaly(None, b)
    assert a.status == "insufficient_data" and a.z is None and a.percent_anomaly is None


def test_soil_percentile_and_z():
    b = b_of(lambda y: 0.2 + 0.001 * (y - 2000))                    # 0.200..0.220
    a = soil_moisture_anomaly(0.2055, b)
    assert a.percentile == pytest.approx(100 * 6 / 21)              # 0.200..0.205 => 6 values <= obs
    assert a.departure == pytest.approx(0.2055 - 0.21)


def test_ndvi_anomaly_difference():
    b = b_of(lambda y: 0.4 + 0.002 * (y - 2010))
    a = ndvi_anomaly(0.30, b)
    assert a.departure == pytest.approx(-0.10) and a.z < -1


def test_modis_decode_scale_and_qa():
    assert modis_ndvi_decode(5000, 0) == (0.5, None)
    assert modis_ndvi_decode(-3000, 0)[0] is None                   # fill
    assert modis_ndvi_decode(5000, 3)[0] is None                    # cloudy
    assert modis_ndvi_decode(5000, 1)[0] is None                    # marginal rejected by default
    assert modis_ndvi_decode(12000, 0)[0] is None                   # out of range


def test_coverage_labels():
    assert coverage_label(10, 10) == "Good data coverage"
    assert coverage_label(8, 10) == "Partial data coverage"
    assert coverage_label(5, 10) == "Limited data"
    assert coverage_label(2, 10) == "Insufficient data" and coverage_label(0, 0) == "Insufficient data"
    assert coverage_summary([1, None, 3, None])["missing_count"] == 2


# ---------------- fingerprint ----------------
def mk(r, s, v, start=1):
    def f(vals): return {f"2024-{start+i:02d}": z for i, z in enumerate(vals)}
    return {"rainfall": f(r), "soil_moisture": f(s), "vegetation": f(v)}


def pats(res): return {p["pattern_type"] for p in res["patterns"]}


def test_composite_exact_and_withheld():
    assert composite_index(-1.0, -2.0, -1.5) == pytest.approx(0.35 * -1 + 0.35 * -2 + 0.3 * -1.5)
    assert composite_index(-1, None, -1) is None
    res = evaluate_fingerprint({"rainfall": {"2024-03": -1.0}, "soil_moisture": {"2024-03": -1.0}})
    assert res["composite"]["value"] is None and "withheld" in res["composite"]["reason"]
    assert res["indicators"]["vegetation"]["status"] == "insufficient_data"   # still individually reported


def test_individual_indicators_always_present():
    res = evaluate_fingerprint(mk([0, 0, 0], [0, 0, 0], [0, 0, 0]))
    assert set(res["indicators"]) == {"rainfall", "soil_moisture", "vegetation"} and res["patterns"] == []


def test_pattern_multiple_negative():
    assert "multiple_indicators_negative" in pats(evaluate_fingerprint(mk([-1.5] * 3, [-1.2] * 3, [0] * 3)))


def test_pattern_rain_up_soil_stressed():
    res = evaluate_fingerprint(mk([-1.5, -0.5, 0.5], [-1.4, -1.3, -1.2], [0, 0, 0]))
    assert "rainfall_improving_soil_moisture_stressed" in pats(res)


def test_pattern_rain_up_veg_stressed():
    res = evaluate_fingerprint(mk([-1.5, -0.5, 0.5], [0, 0, 0], [-1.4, -1.3, -1.2]))
    assert "rainfall_improving_vegetation_stressed" in pats(res)


def test_pattern_soil_declining_normal_rain():
    res = evaluate_fingerprint(mk([0, 0.1, 0], [0.2, -0.4, -1.0], [0, 0, 0]))
    assert "soil_moisture_declining_despite_normal_rainfall" in pats(res)


def test_pattern_veg_deteriorating_despite_rain():
    res = evaluate_fingerprint(mk([-1.0, 0.0, 0.8], [0, 0, 0], [0.2, -0.4, -0.9]))
    assert "vegetation_deteriorating_despite_rainfall_improvement" in pats(res)


def test_pattern_multi_recovery_and_none_when_stressed():
    assert "multiple_indicators_recovering" in pats(evaluate_fingerprint(mk([-1.5, -0.8, 0.0], [-1.6, -1.0, -0.4], [-1, -1, -0.9])))
    res = evaluate_fingerprint(mk([-1.5, -0.8, 0.0], [-1.6, -1.0, -1.2], [-1.0, -0.9, -0.2]))
    assert "multiple_indicators_recovering" not in pats(res)


def test_pattern_needs_complete_trend_window():
    assert evaluate_fingerprint(mk([-0.5, 0.5], [-1.4, -1.3], [0, 0]))["indicators"]["rainfall"]["direction"] is None


def test_no_causal_or_livestock_claims():
    res = evaluate_fingerprint(mk([-1.5, -0.5, 0.5], [-1.4, -1.3, -1.2], [-1.4, -1.3, -1.2]))
    text = str(res).lower()
    for bad in ("livestock", "aquifer", "groundwater depletion", "famine", "caused"):
        assert bad not in text.replace("satellite-derived anomalies do not directly measure crop loss, livestock condition or groundwater.", "")


# ---------------- recovery ----------------
def rs(r, s, v):
    f = lambda vals: {f"2023-{i+1:02d}" if i < 12 else f"2024-{i-11:02d}": z for i, z in enumerate(vals)}
    return {"rainfall": f(r), "soil_moisture": f(s), "vegetation": f(v)}


def test_recovery_across_indicators():
    r = evaluate_recovery(rs([-1.5, -1.8, -0.4, 0, 0.2, 0.1], [-1.2, -1.9, -1.0, -0.3, -0.1, 0], [-1.1, -1.6, -1.2, -0.9, -0.2, -0.1]))
    assert r["status"] == "recovery_across_indicators"
    assert r["indicators"]["rainfall"]["recovery_start"] == "2023-03" and r["indicators"]["rainfall"]["recovery_duration_months"] == 1
    assert r["indicators"]["soil_moisture"]["initial_anomaly_z"] == -1.9


def test_incomplete_recovery_rain_back_others_not():
    r = evaluate_recovery(rs([-1.5, -1.8, -0.4, 0, 0.2, 0.1], [-1.5, -1.9, -1.6, -1.4, -1.3, -1.2], [-1.2, -1.6, -1.5, -1.3, -1.2, -1.1]))
    assert r["status"] == "incomplete_recovery"
    assert r["indicators"]["soil_moisture"]["remaining_anomaly_z"] == -1.2


def test_partial_recovery():
    r = evaluate_recovery(rs([-1.5, -1.8, -0.4, 0, 0.2, 0.1], [-1.2, -1.9, -1.0, -0.3, -0.1, 0], [-1.2, -1.6, -1.5, -1.3, -1.2, -1.1]))
    assert r["status"] == "partial_recovery"


def test_persistent_stress():
    r = evaluate_recovery(rs([-1.5, -1.8, -1.4, -1.2, -1.3, -1.1], [-1.5] * 6, [-1.5] * 6))
    assert r["status"] == "persistent_environmental_stress"


def test_recovery_missing_breaks_run_and_insufficient():
    # rainfall: -0.4 (1 month) then a GAP then 0.2 then relapse: run of 2 never completes => not recovered
    r = evaluate_recovery(rs([-1.5, -1.8, -0.4, None, 0.2, -1.2, -1.1, -1.0], [-1.2, -1.9, -1.0, -0.3, -0.1, 0, 0, 0], [-1.1, -1.6, -1.2, -0.9, -0.2, -0.1, 0, 0]))
    assert r["indicators"]["rainfall"]["status"] == "not_recovered"      # gap not assumed recovered
    assert r["indicators"]["rainfall"]["missing"] == 1 and r["status"] == "persistent_environmental_stress"
    # too few valid observations => insufficient, never "normal"
    assert evaluate_recovery(rs([-1.5, -1.8, -0.4, None, 0.2, -1.2], [-1] * 6, [-1] * 6))["status"] == "insufficient_data"
    assert evaluate_recovery(rs([-1.5, -1.8], [-1, -1], [-1, -1]))["status"] == "insufficient_data"
    r2 = evaluate_recovery(rs([0, 0, 0, 0, 0, 0], [0] * 6, [0] * 6))
    assert r2["status"] == "no_stress_episode"


# ---------------- ranking ----------------
def test_ranking_order_and_missing_not_normal():
    regions = {
        "worse": mk([-2, -2, -2], [-2, -2, -2], [-1.8, -1.9, -2]),
        "mild": mk([-0.2, -0.2, -0.2], [-1.1, -1.1, -1.1], [0.1, 0.1, 0.1]),
        "fine": mk([0.2] * 3, [0.1] * 3, [0.3] * 3),
        "nodata": {"rainfall": {"2024-03": -2.0}},
    }
    rows = rank_regions(regions, "2024-03")
    assert [r["region_id"] for r in rows[:3]] == ["worse", "mild", "fine"]
    nd = rows[-1]
    assert nd["region_id"] == "nodata" and nd["rank"] is None and nd["level"] == "insufficient_data"
    assert rows[0]["label"] == "Environmental Investigation Priority" and rows[0]["level"] == "higher_priority"


def test_ranking_score_hand_computed():
    # one region, all z=-3 for 6 months, steady: stress=1, mag=1, persist=1, trend=0.5 => 100*(.35+.30+.20+.075)=92.5
    r = rank_regions({"x": mk([-3.0] * 6, [-3.0] * 6, [-3.0] * 6)}, "2024-06")[0]
    assert r["score"] == pytest.approx(92.5)
