import joblib
from pathlib import Path


MODEL_DIR = Path(__file__).parent
MODEL_PATH = MODEL_DIR / "model.pkl"
SCALER_PATH = MODEL_DIR / "scaler.pkl"

# Load model and scaler on import
try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
except FileNotFoundError:
    model = None
    scaler = None


def predict_risk(features: dict) -> float:
    """
    Predict disruption risk score from feature dict.
    
    Expected features:
    - wind_speed_kmh
    - precipitation_mm
    - visibility_km
    - news_sentiment_score
    - news_disruption_keywords_count
    - port_congestion_index
    - cargo_type_encoded
    - days_since_last_disruption
    - route_distance_km
    - season
    
    Returns risk score 0.0 to 1.0
    """
    if model is None or scaler is None:
        return 0.0

    feature_order = [
        "wind_speed_kmh",
        "precipitation_mm",
        "visibility_km",
        "news_sentiment_score",
        "news_disruption_keywords_count",
        "port_congestion_index",
        "cargo_type_encoded",
        "days_since_last_disruption",
        "route_distance_km",
        "season",
    ]

    # Extract features in order
    feature_values = [features.get(f, 0.0) for f in feature_order]
    feature_values = [[feature_values]]

    # Scale features
    scaled_features = scaler.transform(feature_values)

    # Predict probability
    risk_score = model.predict_proba(scaled_features)[0][1]
    return float(risk_score)


def get_risk_level(score: float) -> str:
    """
    Convert risk score to human-readable risk level.
    
    Returns: "low", "medium", "high", or "critical"
    """
    if score < 0.25:
        return "low"
    elif score < 0.5:
        return "medium"
    elif score < 0.75:
        return "high"
    else:
        return "critical"


def predict_delay_risk(shipment_id: str) -> float:
    """Legacy function for backward compatibility with routes."""
    _ = shipment_id
    return 0.12
