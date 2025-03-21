# inference_api.py
from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib
from fastapi.middleware.cors import CORSMiddleware

# Define the expected input schema.
class InputData(BaseModel):
    Gender: str
    Tumor_Type: str
    Tumor_Grade: str
    Tumor_Location: str
    Treatment: str
    Treatment_Outcome: str
    Recurrence_Site: str
    Age: float
    Time_to_Recurrence_months: float  # using underscore in API input

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the saved objects
encoders = joblib.load('encoders.pkl')       # Dictionary of LabelEncoders
scaler = joblib.load('scaler.pkl')             # StandardScaler fitted on training features
model = joblib.load('xgb_model.pkl')           # Trained XGBoost model

# Define the original categorical columns in the order used during training
ordered_categorical = ['Gender', 'Tumor Type', 'Tumor Grade', 'Tumor Location', 'Treatment', 'Treatment Outcome', 'Recurrence Site']

@app.post("/predict")
def predict(input_data: InputData):
    # Convert the input data to a dictionary and then to a DataFrame with a single row.
    data = input_data.dict()
    df_new = pd.DataFrame([data])
    
    # Create a mapping from API field names to original training column names.
    mapping = {
        "Gender": "Gender",
        "Tumor_Type": "Tumor Type",
        "Tumor_Grade": "Tumor Grade",
        "Tumor_Location": "Tumor Location",
        "Treatment": "Treatment",
        "Treatment_Outcome": "Treatment Outcome",
        "Recurrence_Site": "Recurrence Site"
    }
    
    # For each categorical feature, apply the corresponding encoder.
    for orig_col in ordered_categorical:
        # Find the corresponding API key.
        api_key = [k for k, v in mapping.items() if v == orig_col][0]
        df_new[orig_col + '_encoded'] = encoders[orig_col].transform([df_new.loc[0, api_key]])
    
    # Rename the numeric column to match the training data's column name.
    df_new.rename(columns={"Time_to_Recurrence_months": "Time to Recurrence (months)"}, inplace=True)
    
    # Build the feature DataFrame in the exact order as used during training.
    feature_columns = [col + '_encoded' for col in ordered_categorical] + ['Age', 'Time to Recurrence (months)']
    X_new = df_new[feature_columns]
    
    # Scale the features using the saved scaler.
    X_new_scaled = scaler.transform(X_new)
    
    # Generate the prediction using the loaded model.
    prediction = model.predict(X_new_scaled)
    
    # Convert the numpy float32 prediction to a native Python float.
    return {"predicted_survival_time_months": float(prediction[0])}
