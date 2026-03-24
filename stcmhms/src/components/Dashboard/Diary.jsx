import React, { useState, useRef, useEffect } from 'react';
import './DashboardCss/Diary.css';
import {
  LiquidGlassButton,
  LiquidGlassContainer,
  LiquidGlassLink
} from '@tinymomentum/liquid-glass-react';
import '@tinymomentum/liquid-glass-react/dist/components/LiquidGlassBase.css';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API outside the component to prevent re-initializing on every render
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Custom Dropdown Component
const CustomSelect = ({ id, value, onChange, options, placeholder, isMoodDropdown = false, onDropdownVisibilityChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (onDropdownVisibilityChange) onDropdownVisibilityChange(isOpen);
  }, [isOpen, onDropdownVisibilityChange]);

  useEffect(() => {
    const selectedOption = options.find(option => option.value === value);
    setSelectedLabel(selectedOption ? selectedOption.label : placeholder || 'Select...');
  }, [value, options, placeholder]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target) &&
          menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const handleSelect = (optionValue, optionLabel) => {
    onChange(optionValue);
    setSelectedLabel(optionLabel);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="custom-select-container">
        <button
          ref={triggerRef}
          type="button"
          className={`custom-select-trigger ${isOpen ? 'open' : ''} ${isMoodDropdown ? 'mood-dropdown' : ''}`}
          onClick={toggleDropdown}
          id={id}
        >
          <span className="custom-select-value">{selectedLabel}</span>
          <svg className={`custom-select-arrow ${isOpen ? 'rotated' : ''}`} viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className={`custom-select-menu ${isMoodDropdown ? 'mood-menu' : ''}`}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`custom-select-option ${value === option.value ? 'selected' : ''} ${isMoodDropdown ? 'mood-option' : ''}`}
              onClick={() => handleSelect(option.value, option.label)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

const MoodDiary = ({
  currentMood,
  setCurrentMood,
  diaryEntry,
  setDiaryEntry,
  onSaveEntry,
  avgScore,
  numEntries
}) => {
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [localMood, setLocalMood] = useState(currentMood || '');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [textareaFocused, setTextareaFocused] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [suggestedEmotions, setSuggestedEmotions] = useState([]);
  const [isLoadingEmotions, setIsLoadingEmotions] = useState(false);
  
  const textareaRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    setLocalMood(currentMood);
  }, [currentMood]);

  const gradeOptions = [
    { value: '7', label: 'Grade 7' },
    { value: '8', label: 'Grade 8' },
    { value: '9', label: 'Grade 9' },
    { value: '10', label: 'Grade 10' },
    { value: '11', label: 'Grade 11' },
    { value: '12', label: 'Grade 12' },
    { value: 'College', label: 'College' }
  ];

  const moodOptions = [
    { value: 1, label: 'Very Low' },
    { value: 2, label: 'Low' },
    { value: 3, label: 'Neutral' },
    { value: 4, label: 'Good' },
    { value: 5, label: 'Excellent' }
  ];

  // FIXED: Fetch emotion suggestions using official SDK to avoid 404 errors
  const fetchEmotionSuggestions = async (text) => {
    if (!text.trim() || text.length < 15) {
      setSuggestedEmotions([]);
      return;
    }

    setIsLoadingEmotions(true);
    try {
      // Using gemini-1.5-flash which is the most stable and fast model for typing analysis
      const model = genAI.getGenerativeModel({
  model: "gemini-1.0-pro"
});

      const prompt = `Analyze this diary entry: "${text}". 
      Suggest exactly 3 emotions from this list: Happy, Sad, Anxious, Excited, Calm, Frustrated, Hopeful, Tired, Grateful, Confused, Motivated, Overwhelmed.
      Return ONLY the 3 words separated by commas. No intro, no periods.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const emotionText = response.text();
      
      const emotions = emotionText
        .split(',')
        .map(e => e.trim().replace(/[^a-zA-Z]/g, '')) 
        .filter(e => e.length > 0)
        .slice(0, 3);
        
      setSuggestedEmotions(emotions);
    } catch (error) {
      console.error('Error fetching emotion suggestions:', error);
    } finally {
      setIsLoadingEmotions(false);
    }
  };

  // FIXED: Debounced change handler to trigger while typing
  const handleDiaryChange = (e) => {
    const newValue = e.target.value;
    setDiaryEntry(newValue);
    
    // Clear previous timer to reset the 1-second delay
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Only call Gemini if user stops typing for 1000ms
    debounceTimerRef.current = setTimeout(() => {
      fetchEmotionSuggestions(newValue);
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveEntry();
  };

  return (
    <section className="mood-section">
      <h2 className="section-title">Daily Mood & Mini Diary</h2>
      
      {dropdownOpen && <div className="custom-select-backdrop" />}
      
      {(textareaFocused || isClosing) && (
        <div 
          className="textarea-backdrop" 
          onClick={() => {
            setIsClosing(true);
            setTimeout(() => {
              setTextareaFocused(false);
              setIsClosing(false);
            }, 300);
          }}
        />
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              <b>NAME:</b>
            </label>
            <input 
              className="form-input" 
              id="name" 
              type="text"
              placeholder="Name of student"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="gradeLevel">
              <b>GRADE LEVEL:</b>
            </label>
            <CustomSelect
              id="gradeLevel"
              value={gradeLevel}
              onChange={setGradeLevel}
              options={gradeOptions}
              placeholder="Select Grade Level"
              onDropdownVisibilityChange={setDropdownOpen}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="diaryEntry">
            Daily Diary Entry:
          </label>
          
          <textarea 
            ref={textareaRef}
            className={`form-textarea ${textareaFocused ? 'modal-open' : ''} ${isClosing ? 'closing' : ''}`}
            id="diaryEntry" 
            placeholder="Start typing your thoughts here..."
            value={diaryEntry}
            onChange={handleDiaryChange}
            onFocus={() => {
              setTextareaFocused(true);
              setIsClosing(false);
            }}
            onBlur={() => {
              setIsClosing(true);
              setTimeout(() => {
                setTextareaFocused(false);
                setIsClosing(false);
              }, 300);
            }}
          />
          {textareaFocused && (
            <div className="emotion-suggestions">
              {isLoadingEmotions && <div className="emotion-tag emotion-loading">AI is analyzing...</div>}
              {!isLoadingEmotions && suggestedEmotions.length > 0 && (
                <>
                  <span className="emotion-label">Emotions Detected:</span>
                  {suggestedEmotions.map((emotion, index) => (
                    <div key={index} className="emotion-tag">
                      {emotion}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="moodSelect">
            In relation to the entry, how would you rate his/her mood?
          </label>
          <CustomSelect
            id="moodSelect"
            value={localMood}
            onChange={(value) => {
              setLocalMood(value);
              setCurrentMood(value);
            }}
            options={moodOptions}
            placeholder="Select Mood Rating"
            isMoodDropdown={true}
            onDropdownVisibilityChange={setDropdownOpen}
          />
        </div>
        
        <div className="score-display">
          <button type="button" className="btndiary-submit" onClick={onSaveEntry}>
            Save entry
          </button>
          {numEntries > 10 && (
            <div className="score-value">
              Mental Health Score: <span>{avgScore}</span>
            </div>
          )}
        </div>
      </form>
    </section>
  );
};

export default MoodDiary;