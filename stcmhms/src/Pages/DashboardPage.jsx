import React, { useState, useEffect } from 'react';
import Navbar from '../components/Dashboard/NavbarDash';
import HeroDash from '../components/Dashboard/HeroDash';
import Diary from '../components/Dashboard/Diary';
import Scorecard from '../components/Dashboard/Scorecard';
import Footer from '../components/Dashboard/FooterDash';
import ProfileDropdown from '../components/Dashboard/Profile';
import { useAuth } from '../components/Login/Auth'; // keep your correct path
import './DashboardPage.css';

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
  function updateScore(newEntries) {
    if (!Array.isArray(newEntries) || newEntries.length === 0) {
      setCurrentScore(50); // default or whatever you prefer
      return;
    }

    // be defensive: ensure mood is a number
    const totalMood = newEntries.reduce((sum, entry) => {
      const moodNum = Number(entry.mood) || 0;
      return sum + moodNum;
    }, 0);

    const averageMood = totalMood / newEntries.length;
    const score = Math.round((averageMood / 5) * 100);
    setCurrentScore(score);
  }

  // -------------------------
  // Fetch past entries from Firestore when user changes
  // -------------------------
  useEffect(() => {
    const fetchEntries = async () => {
      if (!currentUser) return;
      try {
        console.log('Fetching entries for', currentUser.uid);
        const dbEntries = await getUserData(); // uses Auth -> getUserData
        console.log('Fetched entries:', dbEntries);
        setEntries(dbEntries || []);
        updateScore(dbEntries || []);
      } catch (err) {
        console.error('Failed to fetch entries:', err);
      }
    };

    fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]); // we purposely keep getUserData out to avoid excessive re-runs if it isn't stable

  // -------------------------
  // Save entry to Firestore + local state
  // -------------------------
  const handleSaveEntry = async () => {
    if (!diaryEntry.trim()) {
      alert('Please write something in your diary entry.');
      return;
    }

    try {
      // saveUserData should return the saved entry (as implemented in Auth)
      const savedEntry = await saveUserData(currentMood, diaryEntry);

      // If saveUserData returns nothing, build a local entry instead
      const entryToAdd = savedEntry || {
        mood: currentMood,
        diary: diaryEntry,
        date: new Date().toISOString(),
        timestamp: Date.now()
      };

      const newEntries = [...entries, entryToAdd];
      setEntries(newEntries);
      updateScore(newEntries);

      // Clear form
      setDiaryEntry('');
      setCurrentMood(3);

      alert('Entry saved successfully!');
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry. Please try again.');
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
      <Navbar onLogout={handleLogout} />

      <main className="main-content">
        <div className="container">
          <HeroDash onStartToday={handleStartToday} onLearnMore={handleLearnMore} />

          <Diary
            currentMood={currentMood}
            setCurrentMood={setCurrentMood}
            diaryEntry={diaryEntry}
            setDiaryEntry={setDiaryEntry}
            onSaveEntry={handleSaveEntry}
            avgScore={currentScore}
          />

          <Scorecard currentScore={currentScore} />
        </div>
      </main>

      <Footer />

      {currentUser && <ProfileDropdown user={currentUser} onLogout={handleLogout} />}
    </div>
  );
};

export default DashboardPage;
