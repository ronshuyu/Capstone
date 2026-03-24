from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import joblib
import csv
import os

# Load trained model
model = joblib.load("stcmhmsai.pkl")

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DiaryEntry(BaseModel):
    text: str
    mood: Optional[int] = None

class PredictionResponse(BaseModel):
    aiscore: int

CSV_FILE = "Datasets_for_AI_Model/student_diary.csv"
os.makedirs(os.path.dirname(CSV_FILE), exist_ok=True)

@app.get("/")
def root():
    return {"message": "AI Diary Sentiment API is running ✅"}

label_map = {
    "negative": 1,
    "positive": 5
}

@app.post("/predict", response_model=PredictionResponse)
def predict(entry: DiaryEntry):
    # Predict AI score
    aiscore = int(model.predict([entry.text])[0])

    # Save entry to CSV
    file_exists = os.path.isfile(CSV_FILE)
    with open(CSV_FILE, mode="a", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        if not file_exists:
            writer.writerow(["text", "mood", "aiscore"])
        writer.writerow([entry.text, entry.mood if entry.mood is not None else "", aiscore])

    return {"aiscore": aiscore}
