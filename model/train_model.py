# model/train_model.py

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor
import joblib

# Load dataset
df = pd.read_csv("../data/smarteta_dataset.csv")

# Feature engineering
df["order_hour"] = pd.to_datetime(df["order_time"]).dt.hour
df.drop(columns=["order_id", "order_time"], inplace=True)

# Features and target
X = df.drop("delivery_time_min", axis=1)
y = df["delivery_time_min"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Define column types
categorical_cols = ["weather"]
numeric_cols = [col for col in X.columns if col not in categorical_cols]

# Preprocessing + model pipeline
preprocessor = ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols)
], remainder="passthrough")

pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("regressor", XGBRegressor(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42))
])

# Train model
pipeline.fit(X_train, y_train)

# Evaluate
y_pred = pipeline.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
rmse = mean_squared_error(y_test, y_pred) ** 0.5
r2 = r2_score(y_test, y_pred)

print(f"MAE: {mae:.2f}")
print(f"RMSE: {rmse:.2f}")
print(f"R² Score: {r2:.2f}")

# Save model
joblib.dump(pipeline, "model/xgb_eta_model.pkl")
print("✅ Model saved to model/xgb_eta_model.pkl")
