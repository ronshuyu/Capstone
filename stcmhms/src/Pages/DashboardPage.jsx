import React, { useState, useEffect } from 'react';
import Navbar from '../components/Dashboard/NavbarDash';
import HeroDash from '../components/Dashboard/HeroDash';
import Diary from '../components/Dashboard/Diary';
import Scorecard from '../components/Dashboard/Scorecard';
import Footer from '../components/Dashboard/FooterDash';
import ProfileDropdown from '../components/Dashboard/Profile';
import { useAuth } from '../components/Login/Auth'; // keep your correct path
import './DashboardPage.css';
import { doc, onSnapshot } from "firebase/firestore";
import { db } from '../Firebase/Firebase';

const DashboardPage = () => {
  // Use the auth hook inside the component (make sure Auth exports these names)
  const { currentUser, logout, saveUserData, getUserData } = useAuth();

  // Mood tracking states
  const [entries, setEntries] = useState([]);
  const [currentMood, setCurrentMood] = useState(3);
  const [diaryEntry, setDiaryEntry] = useState('');
  const [currentScore, setCurrentScore] = useState(50);

  // -------------------------
// Helper: updateScore (defined BEFORE useEffect)
  // -------------------------
function updateScore(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    setCurrentScore(50); // default
    return;
  }

  // Use scaledScore from each entry (0-100)
  const validScores = entries
    .map(entry => Number(entry.scaledScore))
    .filter(score => !isNaN(score));

  if (validScores.length === 0) {
    setCurrentScore(50);
    return;
  }

  // Average all scaled scores
  const averageScore =
    validScores.reduce((sum, score) => sum + score, 0) / validScores.length;

  setCurrentScore(Math.round(averageScore));
}


  // -------------------------
// Fetch past entries from Firestore when user changes
  // -------------------------
 useEffect(() => {
  if (!currentUser) return;

  const userRef = doc(db, "users", currentUser.uid);
  const unsubscribe = onSnapshot(userRef, (doc) => {
    const entries = doc.data()?.userData || [];
    setEntries(entries);

    // Recalculate currentScore
    const allScaledScores = entries.map(e => Number(e.scaledScore)).filter(s => !isNaN(s));
    const avgScore = Math.round(allScaledScores.reduce((sum, s) => sum + s, 0) / allScaledScores.length);
    setCurrentScore(avgScore);
  });

  return () => unsubscribe();
}, [currentUser]);
 // we purposely keep getUserData out to avoid excessive re-runs if it isn't stable

  // -------------------------
// Save entry to Firestore + local state
  // -------------------------
const handleSaveEntry = async () => {
  if (!diaryEntry.trim()) return alert("Please write something.");

  try {
    const aiResponse = await fetch("https://bnq3xr4j-8000.asse.devtunnels.ms/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: diaryEntry, mood: currentMood })
    });
    const aiData = await aiResponse.json();
    const aiScore = aiData.aiscore;

    const scaledScore = ((aiScore - 1) / 4) * 100;

    const newEntry = {
      text: diaryEntry,
      mood: currentMood,
      aiscore: aiScore,
      scaledScore,
      date: new Date().toISOString(),
      timestamp: Date.now()
    };

    await saveUserData(newEntry); // ✅ pass entry directly

    setEntries([...entries, newEntry]);
    setDiaryEntry("");
    setCurrentMood(3);

    alert("Entry saved and analyzed by AI!");
  } catch (error) {
    console.error(error);
    alert("Failed to save entry. Please try again.");
  }
};




  // CTA handlers
  const handleStartToday = () => {
    document.querySelector('.mood-section')?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  const handleLearnMore = () => {
    alert(
      'This mental health monitoring system helps students track their daily mood and well-being. Regular check-ins provide valuable insights for maintaining mental wellness.'
    );
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logout();
      console.log('User logged out');
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="landing-page">
      <main className="dashboard-main-content">
        <div className="container">
       
          <HeroDash />

          <Diary
            currentMood={currentMood}
            setCurrentMood={setCurrentMood}
            diaryEntry={diaryEntry}
            setDiaryEntry={setDiaryEntry}
            onSaveEntry={handleSaveEntry}
            avgScore={currentScore}
            numEntries={entries.length} // Pass the number of entries
          />

          <Scorecard currentScore={currentScore} numEntries={entries.length} /> 
          </div>
      </main>

      <Footer />

      {currentUser && <ProfileDropdown user={currentUser} onLogout={handleLogout} />}
    </div>
  );
};

export default DashboardPage;