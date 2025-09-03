import React from 'react';
import './DashboardCss/Diary.css';

const MoodDiary = ({ 
  currentMood, 
  setCurrentMood, 
  diaryEntry, 
  setDiaryEntry, 
  onSaveEntry, 
  avgScore 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveEntry();
  };

  return (
    <section className="mood-section">
      <h2 className="section-title">Daily Mood & Mini Diary</h2>
      <p className="section-subtitle">
        Your entries are stored locally until Firebase is connected.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="moodSelect">
            Mood today
          </label>
          <select 
            className="form-select" 
            id="moodSelect"
            value={currentMood}
            onChange={(e) => setCurrentMood(parseInt(e.target.value))}
          >
            <option className='verylow'value={1}>1 - Very Low</option>
            <option className='low' value={2}>2 - Low</option>
            <option className='neutral' value={3}>3 - Neutral</option>
            <option className='good' value={4}>4 - Good</option>
            <option className='excellent' value={5}>5 - Excellent</option>
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="diaryEntry">
            Write a few sentences
          </label>
          <textarea 
            className="form-textarea" 
            id="diaryEntry" 
            placeholder="How are you feeling today?"
            value={diaryEntry}
            onChange={(e) => setDiaryEntry(e.target.value)}
          />
        </div>
        
        <div className="score-display">
          <button type="button" className="btn btn-primary" onClick={onSaveEntry}>
            Save entry
          </button>
          <div className="score-value">
            Avg score: <span>{avgScore}</span>
          </div>
        </div>
      </form>
    </section>
  );
};

export default MoodDiary;