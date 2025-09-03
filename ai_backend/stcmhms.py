from fastapi import FastAPI
from pydantic import BaseModel
import joblib

# Load the trained model
model = joblib.load("stcmhmsai.pkl")

# FastAPI app
app = FastAPI()

# Request body schema
class DiaryEntry(BaseModel):
    text: str

@app.get("/")
def root():
    return {"message": "AI Diary Sentiment API is running ✅"}

@app.post("/predict")
def predict(entry: DiaryEntry):
    prediction = model.predict([entry.text])[0]
    return {"prediction": prediction}
