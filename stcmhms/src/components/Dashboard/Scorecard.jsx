import React from 'react';
import './DashboardCss/Scorecard.css';

const Scorecard = ({ currentScore }) => {
  // Convert score to mood level (1-5 scale)
  const getMoodLevel = (score) => {
    if (score >= 80) return 5; // Very Happy (Green)
    if (score >= 60) return 4; // Happy (Light Green)
    if (score >= 40) return 3; // Neutral (Yellow)
    if (score >= 20) return 2; // Sad (Orange)
    return 1; // Very Sad (Red)
  };

  const getMoodData = (level) => {
    const moods = {
      1: { emoji: '😞', color: '#FF4757', label: 'Very Sad' },
      2: { emoji: '🙁', color: '#FF6B35', label: 'Sad' },
      3: { emoji: '😐', color: '#FFA726', label: 'Neutral' },
      4: { emoji: '🙂', color: '#66BB6A', label: 'Happy' },
      5: { emoji: '😊', color: '#4CAF50', label: 'Very Happy' }
    };
    return moods[level];
  };

  const currentMoodLevel = getMoodLevel(currentScore);
  const currentMood = getMoodData(currentMoodLevel);

  return (
    <section className="score-section">
      <h2 className="section-title">Your overall mental health score</h2>

      <div className="mood-scale">
        <div className="mood-scale-container">
          {[1, 2, 3, 4, 5].map((level) => {
            const mood = getMoodData(level);
            const isActive = level === currentMoodLevel;
            
            return (
              <div 
                key={level}
                className={`mood-item ${isActive ? 'active' : ''}`}
                style={{ 
                  backgroundColor: isActive ? mood.color : '#f0f0f0',
                  borderColor: mood.color 
                }}
              >
                <span className="mood-emoji">{mood.emoji}</span>
              </div>
            );
          })}
        </div>
        
        <div className="mood-indicator">
          <div 
            className="mood-pointer"
            style={{ 
              left: `${((currentMoodLevel - 1) / 4) * 100}%`,
              backgroundColor: currentMood.color 
            }}
          />
        </div>
        
        <div className="mood-labels">
          <span>Very Sad</span>
          <span style={{ paddingLeft: '35px' }}>Sad</span>
          <span style={{ paddingLeft: '50px' }}>Neutral</span>
          <span style={{ paddingLeft: '45px' }}>Happy</span>
          <span>Very Happy</span>
        </div>
      </div>

      <div className="current-mood-display">
        <span className="current-mood-label">Current mood: </span>
        <span 
          className="current-mood-text"
          style={{ color: currentMood.color }}
        >
          {currentMood.emoji} {currentMood.label}
        </span>
      </div>
    </section>
  );
};

export default Scorecard;