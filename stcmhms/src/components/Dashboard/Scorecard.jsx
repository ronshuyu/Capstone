import React from 'react';
import './DashboardCss/Scorecard.css';

const Scorecard = ({ currentScore, numEntries }) => {  // Add numEntries prop
  // Convert score to mood level (1-5 scale)
  const getMoodLevel = (score) => {
    if (score >= 80) return 1; // Very Happy (Green)
    if (score >= 60) return 2; // Happy (Light Green)
    if (score >= 40) return 3; // Neutral (Yellow)
    if (score >= 20) return 4; // Sad (Orange)
    return 5; // Very Sad (Red)
  };

  const getMoodData = (level) => {
    const moods = {
      1: { emoji: '🌤️', color: '#4CAF50', label: 'Minimal Depression' },
      2: { emoji: '☁️', color: '#66BB6A', label: 'Mild Depression' },
      3: { emoji: '🌧️', color: '#FFA726', label: 'Moderate Depression' },
      4: { emoji: '⛈️', color: '#FF6B35', label: 'Moderately Severe' },
      5: { emoji: '🌪️', color: '#FF4757', label: 'Severe Depression' }
    };
    return moods[level];
  };

  const currentMoodLevel = getMoodLevel(currentScore);
  const currentMood = getMoodData(currentMoodLevel);

  const moodData = [
    { emoji: '🌤️', label: 'Minimal Depression' },
    { emoji: '☁️', label: 'Mild Depression' },
    { emoji: '🌧️', label: 'Moderate Depression' },
    { emoji: '⛈️', label: 'Moderately Severe' },
    { emoji: '🌪️', label: 'Severe Depression' }
  ];

  return (
    <section className="score-section">
      <div className="mood-scale">
        <div className="mood-scale-container">
          {moodData.map((mood, index) => {
            const isActive = index + 1 === currentMoodLevel;
            
            return (
              <div key={index} className="mood-item-group">
                <div 
                  className={`mood-item ${isActive ? 'active' : ''}`}
                  style={{ 
                    backgroundColor: isActive ? mood.color : '#f0f0f0',
                    borderColor: mood.color 
                  }}
                >
                  <span className="mood-emoji">{mood.emoji}</span>
                </div>
                <div className="mood-label">{mood.label}</div>
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
      </div>

    </section>
  );
};

export default Scorecard;