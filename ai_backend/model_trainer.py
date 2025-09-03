import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
import joblib

# Load dataset
df = pd.read_csv("Datasets_for_AI_Model/student_diary.csv")

# Split data into features (text) and labels
X = df["text"]
y = df["label"]

# Create a text classification pipeline
model = make_pipeline(TfidfVectorizer(), MultinomialNB())

# Train the model
model.fit(X, y)

# Save the trained model to a file
joblib.dump(model, "stcmhmsai.pkl")

print("✅ Model trained and saved as stcmhmsai.pkl")
