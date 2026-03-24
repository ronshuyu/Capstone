import express from 'express';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const router = express.Router();

const MODEL = process.env.EMOTION_MODEL || 'gemini-2.5-flash'; // valid Gemini model

const ALLOWED_EMOTIONS = new Set([
  'happy', 'sad', 'anxious', 'excited', 'calm', 'frustrated',
  'hopeful', 'tired', 'grateful', 'confused', 'motivated',
  'overwhelmed', 'bored', 'relaxed', 'angry', 'lonely',
  'proud', 'nervous', 'content', 'lazy', 'fearful', 'embarrassed',

  'joyful', 'cheerful', 'optimistic', 'inspired', 'energized',
  'peaceful', 'satisfied', 'fulfilled', 'loved', 'appreciated',
  'confident', 'secure', 'playful', 'amused', 'delighted',
  'thrilled', 'ecstatic', 'serene', 'comfortable', 'uplifted',
  'encouraged', 'refreshed', 'relieved', 'blessed',

  'depressed', 'hopeless', 'worthless', 'guilty', 'ashamed',
  'jealous', 'resentful', 'irritated', 'stressed', 'panicked',
  'heartbroken', 'rejected', 'insecure', 'helpless', 'drained',
  'tense', 'pressured', 'discouraged', 'hurt', 'betrayed',
  'abandoned', 'trapped', 'exhausted', 'burned out',

  'indifferent', 'neutral', 'blank', 'detached', 'curious',
  'reflective', 'thoughtful', 'uncertain', 'conflicted',
  'surprised', 'shocked', 'nostalgic', 'homesick',

  'focused', 'distracted', 'restless', 'sleepy', 'alert',
  'productive', 'unproductive', 'procrastinating',

  'connected', 'supported', 'isolated', 'misunderstood',
  'accepted', 'valued', 'ignored', 'judged',

  'hyper', 'sluggish', 'fatigued', 'recharged',

  'worried', 'uneasy', 'apprehensive', 'paranoid',
  'annoyed', 'agitated', 'furious', 'hostile',
  'self-conscious', 'inadequate', 'empowered',
  'grieving', 'yearning', 'disappointed', 'suspicious'
]);

const SYSTEM_PROMPT = `You are a strict emotion-detection assistant for a student mental health diary.

Task:
Analyze the diary entry and return ONLY a valid JSON array containing 2 to 4 emotions that best match the entry.

Allowed emotions:
${[...ALLOWED_EMOTIONS].join(', ')}

Rules:
- Use ONLY exact emotions from the allowed list above.
- Do NOT invent new labels.
- Do NOT explain anything.
- Do NOT return markdown.
- Do NOT return an object.
- Return raw JSON array only.
- Choose the most relevant emotions, not every possible emotion.
- If the text is too short, too vague, or unclear, return [].

Example outputs:
["sad","overwhelmed","tired"]
["happy","grateful","motivated"]
[]`;
let _genAI = null;
const getClient = () => {
  if (!_genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables.');
    }
    _genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _genAI;
};

const parseEmotions = (raw) => {
  try {
    const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((e) => String(e).toLowerCase().trim())
      .filter((e) => ALLOWED_EMOTIONS.has(e))
      .slice(0, 4);
  } catch {
    return [];
  }
};

router.post('/suggest-emotions', async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Request body must include a "text" string.' });
  }

  const trimmed = text.trim();
  if (trimmed.length < 20) {
    return res.status(200).json({ emotions: [] });
  }

  const safeText = trimmed.slice(0, 1200);

  try {
    const genAI = getClient();

    const result = await genAI.models.generateContent({
      model: MODEL,
      contents: `${SYSTEM_PROMPT}\n\nDiary entry: "${safeText}"`,
    });

    const raw = result.text; // note: 'text()' method does not exist here
    const emotions = parseEmotions(raw);

    return res.status(200).json({ emotions });
  } catch (err) {
    console.error('[suggest-emotions] Gemini error:', err?.message || err);
    return res.status(500).json({
      emotions: [],
      error: 'Failed to analyze emotions. Please try again.',
    });
  }
});

export default router;