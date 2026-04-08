import os
import numpy as np
import pandas as pd
from pathlib import Path

import joblib
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import xgboost as xgb


DISRUPTION_KEYWORDS = [
    "strike", "flood", "closure", "protest", "storm", "delay",
    "accident", "congestion", "damage", "recall", "ban", "embargo",
    "warning", "alert", "outbreak", "crisis", "emergency", "incident",
    "hazard", "risk"
]

MODEL_DIR = Path(__file__).parent
MODEL_PATH = MODEL_DIR / "model.pkl"
SCALER_PATH = MODEL_DIR / "scaler.pkl"


def _generate_synthetic_data(n_samples: int = 5000) -> tuple[pd.DataFrame, np.ndarray]:
    """Generate synthetic training data with feature engineering."""
    np.random.seed(42)

    data = {
        "wind_speed_kmh": np.random.uniform(0, 150, n_samples),
        "precipitation_mm": np.random.uniform(0, 200, n_samples),
        "visibility_km": np.random.uniform(0, 20, n_samples),
        "news_sentiment_score": np.random.uniform(-1, 1, n_samples),
        "news_disruption_keywords_count": np.random.randint(0, 21, n_samples),
        "port_congestion_index": np.random.uniform(0, 10, n_samples),
        "cargo_type_encoded": np.random.randint(0, 4, n_samples),
        "days_since_last_disruption": np.random.randint(0, 366, n_samples),
        "route_distance_km": np.random.uniform(100, 15000, n_samples),
        "season": np.random.randint(0, 4, n_samples),
    }

    df = pd.DataFrame(data)

    # Generate labels using logical rules
    labels = np.zeros(n_samples, dtype=int)

    # Rule 1: High wind + negative sentiment + keywords = higher risk
    high_wind = df["wind_speed_kmh"] > 80
    negative_sentiment = df["news_sentiment_score"] < -0.3
    keywords_present = df["news_disruption_keywords_count"] > 5
    labels[high_wind & negative_sentiment & keywords_present] = 1

    # Rule 2: High precipitation + low visibility = high risk
    heavy_precip = df["precipitation_mm"] > 100
    low_visibility = df["visibility_km"] < 5
    labels[heavy_precip & low_visibility] = 1

    # Rule 3: High port congestion + perishable/hazmat cargo = risk
    high_congestion = df["port_congestion_index"] > 7
    hazmat_perishable = df["cargo_type_encoded"].isin([2, 3])
    labels[high_congestion & hazmat_perishable] = 1

    # Rule 4: Recent disruptions increase risk probability
    recent_disruption = df["days_since_last_disruption"] < 30
    labels[recent_disruption & (np.random.random(n_samples) < 0.6)] = 1

    # Rule 5: Natural randomness (10% baseline risk)
    random_risk = np.random.random(n_samples) < 0.1
    labels[random_risk] = 1

    return df, labels


def train_model() -> str:
    """Train XGBoost model on synthetic data and save to disk."""
    print("[ML Pipeline] Generating synthetic training dataset...")
    X, y = _generate_synthetic_data(n_samples=5000)
    print(f"[ML Pipeline] Dataset shape: {X.shape}")
    print(f"[ML Pipeline] Positive samples: {y.sum()} ({y.sum() / len(y) * 100:.1f}%)")

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Scale features
    print("[ML Pipeline] Fitting scaler...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train XGBoost classifier
    print("[ML Pipeline] Training XGBoost classifier...")
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbose=0,
    )
    model.fit(X_train_scaled, y_train, eval_set=[(X_test_scaled, y_test)], verbose=False)

    # Evaluate
    y_pred = model.predict(X_test_scaled)
    print("\n[ML Pipeline] Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["No Risk", "At Risk"]))

    print("\n[ML Pipeline] Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # Feature importances
    feature_importance = pd.DataFrame(
        {"feature": X.columns, "importance": model.feature_importances_}
    ).sort_values("importance", ascending=False)
    print("\n[ML Pipeline] Feature Importances:")
    print(feature_importance.to_string(index=False))

    # Save model and scaler
    print(f"\n[ML Pipeline] Saving model to {MODEL_PATH}")
    joblib.dump(model, MODEL_PATH)
    print(f"[ML Pipeline] Saving scaler to {SCALER_PATH}")
    joblib.dump(scaler, SCALER_PATH)

    return "Model training completed successfully"
