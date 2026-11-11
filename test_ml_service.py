#!/usr/bin/env python3
"""
Unit & Integration Verification for SENTRY (PredictIQ) ML Microservice
"""

import sys
from fastapi.testclient import TestClient
from ml_service import app, autoencoder, rul_gru

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["models_loaded"] is True
    print("[PASS] GET /health verified")

def test_predict_anomaly_nominal():
    # Nominal healthy sensors
    nominal_payload = {
        "sensors": [642.0, 1585.0, 553.5, 2388.0, 47.45, 0.38],
        "unit_id": 1,
        "cycle": 15
    }
    res = client.post("/predict/anomaly", json=nominal_payload)
    assert res.status_code == 200
    data = res.json()
    assert "mse" in data
    assert "threshold_3sigma" in data
    assert "severity" in data
    print("[PASS] POST /predict/anomaly (Nominal) verified -> MSE:", data["mse"], "Severity:", data["severity"])

def test_predict_anomaly_critical():
    # Degraded overheated/vibrating sensors
    degraded_payload = {
        "sensors": [655.0, 1635.0, 532.0, 2372.0, 45.2, 2.45],
        "unit_id": 1,
        "cycle": 185
    }
    res = client.post("/predict/anomaly", json=degraded_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["reconstruction_error_ratio"] > 0.8
    print("[PASS] POST /predict/anomaly (Degraded) verified -> Severity:", data["severity"], "Ratio:", data["reconstruction_error_ratio"])

def test_predict_rul():
    # 30-cycle sliding window
    window = [[642.0, 1585.0, 553.5, 2388.0, 47.45, 0.38] for _ in range(30)]
    payload = {
        "sensor_sequence": window,
        "unit_id": 1,
        "current_cycle": 30
    }
    res = client.post("/predict/rul", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "rul_predicted" in data
    assert len(data["confidence_interval"]) == 2
    assert data["confidence_interval"][0] <= data["rul_predicted"] <= data["confidence_interval"][1]
    print("[PASS] POST /predict/rul verified -> RUL:", data["rul_predicted"], "CI:", data["confidence_interval"])

if __name__ == "__main__":
    print("\n--- Running SENTRY ML Verification Suite ---")
    test_health()
    test_predict_anomaly_nominal()
    test_predict_anomaly_critical()
    test_predict_rul()
    print("\n[SUCCESS] ALL ML SERVICE TESTS PASSED!\n")
