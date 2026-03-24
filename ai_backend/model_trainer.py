import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
import joblib
import os

CSV_FILE = "Datasets_for_AI_Model/student_diary.csv"

if not os.path.exists(CSV_FILE):
    raise FileNotFoundError(f"Diary CSV not found: {CSV_FILE}. Please add some entries first.")

# Read CSV safely with quotes
df = pd.read_csv(CSV_FILE, quotechar='"')

# Drop rows with missing values
df = df.dropna(subset=['text', 'mood', 'aiscore'])
df = df[df['text'].str.strip().ne('')]

# Ensure correct types
X = df['text'].astype(str)
y = df['aiscore'].astype(int)  # labels 1-5 as integers

# Train pipeline
model = make_pipeline(TfidfVectorizer(), MultinomialNB())
model.fit(X, y)

# Save model
joblib.dump(model, "stcmhmsai.pkl")

print("Model trained and saved as stcmhmsai.pkl")
