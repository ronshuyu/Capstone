import React, { useState, useRef, useEffect, useCallback } from 'react';
import './DashboardCss/Diary.css';
import { db } from "../../Firebase/Firebase";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
  startAt,
  endAt,
  limit,
  getDocs
} from "firebase/firestore";
import { useToast } from "../../contexts/ToastContext"; // adjust path if needed


const EMOTION_WEIGHTS = {
  happy: 10,
  joyful: 12,
  calm: 8,
  relaxed: 8,
  grateful: 10,
  hopeful: 8,
  motivated: 6,
  proud: 6,
  content: 6,
  excited: 5,

  sad: -10,
  anxious: -12,
  overwhelmed: -14,
  angry: -10,
  lonely: -12,
  fearful: -12,
  nervous: -6,
  frustrated: -8,
  tired: -5,
  confused: -4,
  embarrassed: -5,
  stressed: -10,
  hopeless: -16,
  helpless: -14,
  depressed: -18,
  'burned out': -14
};

const calculateMentalHealthScore = (mood, selectedEmotions = []) => {
  const moodComponent = (Number(mood) / 5) * 70;

  const emotionEffect = selectedEmotions.reduce((sum, emotion) => {
    return sum + (EMOTION_WEIGHTS[emotion] || 0);
  }, 0);

  const boundedEmotionEffect = Math.max(-30, Math.min(30, emotionEffect));
  const total = moodComponent + 30 + boundedEmotionEffect;

  return Math.round(Math.max(0, Math.min(100, total)));
};


// ─── Strong-keyword filter ────────────────────────────────────────────────────
const STRONG_KEYWORDS = new Set([
  'happy', 'sad', 'angry', 'anxious', 'tired', 'excited',
  'depressed', 'joyful', 'furious', 'scared', 'elated', 'miserable',
]);

const hasStrongKeywords = (text) => {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  return words.some((w) => STRONG_KEYWORDS.has(w));
};

// ─── Stable student doc ID from name + grade ─────────────────────────────────
const makeStudentId = (name, gradeLevel) => {
  return `${name}-${gradeLevel}`
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

// ─── Emotion Chips ────────────────────────────────────────────────────────────
const EmotionChips = ({ emotions, isAnalyzing, onChipClick, selectedEmotions }) => {
  const hasContent = isAnalyzing || emotions.length > 0;
  if (!hasContent) return null;

  return (
    <div className="emotion-suggestions">
      {isAnalyzing && (
        <div className="emotion-tag emotion-loading">
          <span className="emotion-dot" />
          AI is analyzing…
        </div>
      )}
      {!isAnalyzing && emotions.length > 0 && (
        <>
          <span className="emotion-label">Emotions Detected:</span>
          {emotions.map((emotion, i) => (
            <button
              key={i}
              type="button"
              className={`emotion-tag emotion-chip ${selectedEmotions.includes(emotion) ? 'selected' : ''}`}
              onClick={() => onChipClick(emotion)}
              title={`Toggle ${emotion}`}
            >
              #{emotion}
            </button>
          ))}
        </>
      )}
    </div>
  );
};

// ─── Custom Dropdown ──────────────────────────────────────────────────────────
const CustomSelect = ({
  id,
  value,
  onChange,
  options,
  placeholder,
  isMoodDropdown = false,
  onDropdownVisibilityChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const handleSelect = (optionValue, optionLabel) => {
  onChange(optionValue);
  setSelectedLabel(optionLabel);
  setIsOpen(false);
};

  useEffect(() => {
    if (onDropdownVisibilityChange) onDropdownVisibilityChange(isOpen);
  }, [isOpen, onDropdownVisibilityChange]);

  useEffect(() => {
    const selectedOption = options.find((option) => option.value === value);
    setSelectedLabel(selectedOption ? selectedOption.label : placeholder || 'Select...');
  }, [value, options, placeholder]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        triggerRef.current && !triggerRef.current.contains(event.target) &&
        menuRef.current && !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) setIsOpen(false);
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



  return (
    <>
      <div className="custom-select-container">
        <button
          ref={triggerRef}
          type="button"
          className={`custom-select-trigger ${isOpen ? 'open' : ''} ${isMoodDropdown ? 'mood-dropdown' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          id={id}
        >
          <span className="custom-select-value">{selectedLabel}</span>
          <svg className={`custom-select-arrow ${isOpen ? 'rotated' : ''}`} viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z" />
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

// ─── Main MoodDiary Component ─────────────────────────────────────────────────
const MoodDiary = ({
  currentMood,
  setCurrentMood,
  diaryEntry,
  setDiaryEntry,
  onSaveEntry,
  avgScore,
  numEntries,
}) => {
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [localMood, setLocalMood] = useState(currentMood || '');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [textareaFocused, setTextareaFocused] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { showToast } = useToast();
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestedEmotions, setSuggestedEmotions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const textareaRef = useRef(null);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

const fetchNameSuggestions = useCallback(async (searchText) => {
  const cleanSearch = searchText.trim().toLowerCase();

  if (!cleanSearch) {
    setNameSuggestions([]);
    setShowSuggestions(false);
    return;
  }

  try {
    const studentsRef = collection(db, "diaryEntries");
    const q = query(
      studentsRef,
      orderBy("lowercaseName"),
      startAt(cleanSearch),
      endAt(cleanSearch + "\uf8ff"),
      limit(5)
    );

    const snapshot = await getDocs(q);

    const suggestions = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    setNameSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0);
  } catch (error) {
    console.error("Error fetching name suggestions:", error);
    setNameSuggestions([]);
    setShowSuggestions(false);
  }
}, []);

const handleSelectStudent = (student) => {
  setName(student.name || '');
  setGradeLevel(student.gradeLevel || '');
  setNameSuggestions([]);
  setShowSuggestions(false);
};

  useEffect(() => {
    setLocalMood(currentMood);
  }, [currentMood]);

  const fetchEmotions = useCallback(async (text) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsAnalyzing(true);
    try {
      const res = await fetch("https://capstone-dr1n.onrender.com/suggest-emotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: abortRef.current?.signal
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const emotions = (data.emotions || [])
        .map((e) => e.toLowerCase().trim())
        .filter(Boolean);

      const filteredEmotions = hasStrongKeywords(text)
          ? emotions.filter((e) => !STRONG_KEYWORDS.has(e))
          : emotions;

        setSuggestedEmotions(filteredEmotions);
        setSelectedEmotions(filteredEmotions);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('[MoodDiary] emotion fetch error:', err);
        setSuggestedEmotions([]);
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);

    if (!diaryEntry.trim() || diaryEntry.length < 10) {
  setSuggestedEmotions([]);
  setSelectedEmotions([]);
  setIsAnalyzing(false);
  return;
}

    debounceRef.current = setTimeout(() => fetchEmotions(diaryEntry), 600);

    return () => {
      clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [diaryEntry, fetchEmotions]);

  const handleChipClick = (emotion) => {
  setSelectedEmotions((prev) =>
    prev.includes(emotion)
      ? prev.filter((e) => e !== emotion)
      : [...prev, emotion]
  );
};

  const handleDiaryChange = (e) => {
    setDiaryEntry(e.target.value);
  };

  const handleSave = async (e) => {
  e.preventDefault();

  try {
    const cleanName = name.trim();
    const cleanGradeLevel = String(gradeLevel).trim();
    const cleanEntry = diaryEntry.trim();

    if (!cleanName || !cleanGradeLevel || !cleanEntry || !localMood) {
      showToast("Please fill in all fields", "error");
      return;
    }

    const studentId = makeStudentId(cleanName, cleanGradeLevel);
    const studentRef = doc(db, "diaryEntries", studentId);

    const mentalHealthScore = calculateMentalHealthScore(localMood, selectedEmotions);

    // Save / update student profile doc
    await setDoc(
      studentRef,
      {
        name: cleanName,
        lowercaseName: cleanName.toLowerCase(),
        gradeLevel: cleanGradeLevel,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Save individual diary entry
    await addDoc(collection(studentRef, "entries"), {
      mood: localMood,
      entry: cleanEntry,
      emotions: selectedEmotions,
      mentalHealthScore,
      createdAt: serverTimestamp(),
    });

    // Recompute summary values
    const entriesSnapshot = await getDocs(collection(studentRef, "entries"));

    const scores = entriesSnapshot.docs
      .map((docSnap) => docSnap.data().mentalHealthScore)
      .filter((score) => typeof score === "number");

    const totalEntries = scores.length;

    const averageMentalHealthScore =
      totalEntries > 0
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / totalEntries)
        : mentalHealthScore;

    await setDoc(
      studentRef,
      {
        latestMentalHealthScore: mentalHealthScore,
        averageMentalHealthScore,
        totalEntries,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    showToast("Entry saved successfully!", "success");

    setName('');
    setGradeLevel('');
    setDiaryEntry('');
    setSuggestedEmotions([]);
    setSelectedEmotions([]);
    setLocalMood('');
    setCurrentMood('');
    setNameSuggestions([]);
    setShowSuggestions(false);

  } catch (error) {
    console.error("Error saving entry:", error);
    showToast("Failed to save entry. Try again.", "error");
  }
};

  const gradeOptions = [
    { value: '7', label: 'Grade 7' },
    { value: '8', label: 'Grade 8' },
    { value: '9', label: 'Grade 9' },
    { value: '10', label: 'Grade 10' },
    { value: '11', label: 'Grade 11' },
    { value: '12', label: 'Grade 12' },
    { value: 'College', label: 'College' },
  ];

  const moodOptions = [
    { value: 1, label: '1 - Very Low' },
    { value: 2, label: '2 - Low' },
    { value: 3, label: '3 - Neutral' },
    { value: 4, label: '4 - Good' },
    { value: 5, label: '5 - Excellent' },
  ];

  return (
    <section className="mood-section">
      <h2 className="section-title">Daily Mood &amp; Mini Diary</h2>

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

      <form onSubmit={handleSave}>
        <div className="form-row">
          <div className="form-group" style={{ position: "relative" }}>
  <label className="form-label" htmlFor="name"><b>NAME:</b></label>
  <input
    className="form-input"
    id="name"
    type="text"
    placeholder="Name of student"
    value={name}
    onChange={(e) => {
      const value = e.target.value;
      setName(value);
      fetchNameSuggestions(value);
    }}
    onFocus={() => {
      if (nameSuggestions.length > 0) setShowSuggestions(true);
    }}
    onBlur={() => {
      setTimeout(() => setShowSuggestions(false), 150);
    }}
  />

  {showSuggestions && nameSuggestions.length > 0 && (
    <div className="name-suggestions-dropdown">
      {nameSuggestions.map((student) => (
        <button
          key={student.id}
          type="button"
          className="name-suggestion-item"
          onClick={() => handleSelectStudent(student)}
        >
          {student.name} — Grade {student.gradeLevel}
        </button>
      ))}
    </div>
  )}
</div>

          <div className="form-group">
            <label className="form-label" htmlFor="gradeLevel"><b>GRADE LEVEL:</b></label>
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

          {(textareaFocused || isAnalyzing || suggestedEmotions.length > 0) && (
            <EmotionChips
              emotions={suggestedEmotions}
              isAnalyzing={isAnalyzing}
              onChipClick={handleChipClick}
              selectedEmotions={selectedEmotions}
            />
          )}

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
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="moodSelect">
            On a scale of 1-5, how would you rate his/her overall mood today?
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
          <button type="submit" className="btndiary-submit">
            Save entry
          </button>
        </div>
      </form>
    </section>
  );
};

export default MoodDiary;