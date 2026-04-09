# Step-by-Step Guide: Training on Real Supply Chain Data

This guide explains from the ground up how to switch your application from using generated "fake" synthetic data to the authentic **DataCo Smart Supply Chain Dataset**. Training your AI on this massive Kaggle dataset will give your platform mathematically sound predictions on global delivery risks.

---

## 1. How the Model Works (The Basics)
In Machine Learning classification, an AI tries to find hidden patterns. To do this, we give the model two things:
1. **Features (`X`)**: The inputs (e.g., Shipping Mode, Cost, Destination City).
2. **Target (`y`)**: The definitive answer, which in our case is the column `Late_delivery_risk` (0 for On-Time, 1 for Delayed).

By feeding an `XGBoost` model over 180,000 real rows from DataCo, the AI learns which combinations of Shipping Modes and Regions tend to cause shipping delays. 

---

## 2. Moving the Dataset
Your app runs its Python backend isolated in Docker. For the AI code to access the dataset, you must physically move the file into the backend's Machine Learning directory.

- **Copy:** `DataCoSupplyChainDataset.csv`
- **Paste into:** `chainpulse-backend/app/ml/DataCoSupplyChainDataset.csv`

---

## 3. Rewriting the Code to Use Real Data

Because you are using new columns, three files inside your backend must be updated to expect the new structure.

### A. Updating `app/ml/train.py` (The Trainer) 
You need to delete the `_generate_synthetic_data` function entirely. Instead, use pandas to `read_csv` and process the real Kaggle features. Here is what your new `train_model()` function should look like:

```python
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
import xgboost as xgb

def train_model():
    print("[ML] Loading DataCo Supply Chain Dataset...")
    # 1. Load the Kaggle data (uses latin-1 encoding due to special characters)
    df = pd.read_csv("app/ml/DataCoSupplyChainDataset.csv", encoding='latin-1')
    
    # 2. Select authentic features provided by DataCo
    numerical_features = ['Days for shipment (scheduled)', 'Order Item Quantity', 'Product Price']
    categorical_features = ['Shipping Mode', 'Market', 'Order Region']
    
    features = numerical_features + categorical_features
    df = df.dropna(subset=features + ['Late_delivery_risk']) # Data Cleanup

    X = df[features]
    y = df['Late_delivery_risk']

    # 3. Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 4. Convert text categories (like "First Class") into numbers the AI understands
    preprocessor = ColumnTransformer(transformers=[
        ('num', StandardScaler(), numerical_features),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ])
    X_train_processed = preprocessor.fit_transform(X_train)
    
    # 5. Train the Model!
    model = xgb.XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.1)
    model.fit(X_train_processed, y_train)

    # 6. Save the actual brain to files
    joblib.dump(model, "app/ml/model.pkl")
    joblib.dump(preprocessor, "app/ml/scaler.pkl")

    print("[ML] Finished Training! model.pkl successfully exported.")
```

### B. Updating `app/ml/predictor.py` (The Live Interface)
Currently, your `predictor.py` expects fake columns like "wind_speed_kmh". You must update `predict_risk(features: dict)` so that when the React app asks for a live risk calculation, it feeds the new model the correct columns:

```python
def predict_risk(features: dict) -> float:
    # We take the live shipment data and map it perfectly to our newly trained DataCo columns
    input_df = pd.DataFrame([{
        'Days for shipment (scheduled)': features.get('scheduled_shipping_days', 4),
        'Order Item Quantity': features.get('order_item_quantity', 1),
        'Product Price': features.get('product_price', 100.0),
        'Shipping Mode': features.get('shipping_mode', 'Standard Class'),
        'Market': features.get('market', 'USCA'),
        'Order Region': features.get('order_region', 'US Center')
    }])

    # Scale the live data exactly how we scaled the training data
    processed_features = scaler.transform(input_df)

    # Output the live prediction
    risk_score = model.predict_proba(processed_features)[0][1]
    return float(risk_score)
```

### C. Updating `app/routes/predictions.py` (The Web Request)
Inside `predictions.py`, there is a function called `_generate_mock_features(shipment)`. You must change this so your API generates dictionaries matching the DataCo format instead of weather data.

```python
def _generate_mock_features(shipment: Shipment) -> dict:
    import random
    return {
        "scheduled_shipping_days": random.randint(2, 6),
        "order_item_quantity": random.randint(1, 10),
        "product_price": random.uniform(20.0, 500.0),
        "shipping_mode": random.choice(["Standard Class", "First Class"]),
        "market": "Europe" if "Rotterdam" in shipment.destination else "USCA",
        "order_region": "Western Europe" if "Rotterdam" in shipment.destination else "US Center"
    }
```

---

## 4. How to Execute the Training

Once you have successfully edited those 3 files and pasted your CSV, you can formally kick off the training. 

If your Docker containers are already running, open a new Powershell terminal in your main `ChainGuard` folder and simply run:

```powershell
docker-compose exec backend python -c "from app.ml.train import train_model; train_model()"
```

### What Happens When You Run This? 
1. The backend reads all **95MB** of your `DataCoSupplyChainDataset.csv`.
2. It mathematically processes tens of thousands of real delivery reports.
3. It learns the correlation between variables (e.g., "Do shipments going to the 'US Center' via 'Standard Class' get delayed more often?").
4. It overwrites `model.pkl` and `scaler.pkl` with the authentic trained parameters.
5. In your React Dashboard, live Risk Scores will now be calculated using real statistical logistics logic instead of randomness!
