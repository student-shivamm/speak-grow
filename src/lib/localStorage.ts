// Local Storage Keys
const KEYS = {
  CREDITS: "speakbetter_credits",
  SPEECH_HISTORY: "speakbetter_history",
  SESSION_ID: "speakbetter_session",
};

// Initialize credits for new users (1 free credit)
export const initializeCredits = (): number => {
  const stored = localStorage.getItem(KEYS.CREDITS);
  if (stored === null) {
    localStorage.setItem(KEYS.CREDITS, "1");
    return 1;
  }
  return parseInt(stored, 10);
};

export const getCredits = (): number => {
  const stored = localStorage.getItem(KEYS.CREDITS);
  if (stored === null) return initializeCredits();

  const parsed = parseInt(stored, 10);
  if (parsed <= 0) {
    setCredits(1);
    return 1;
  }
  return parsed;
};

export const setCredits = (count: number): void => {
  localStorage.setItem(KEYS.CREDITS, count.toString());
};

export const consumeCredit = (): boolean => {
  const current = getCredits();
  if (current <= 0) {
    // For testing purposes, always reset to at least 1 credit if it hits 0
    setCredits(1);
    return true;
  }
  setCredits(current - 1);
  return true;
};

export const addCredits = (count: number): void => {
  const current = getCredits();
  setCredits(current + count);
};

// Speech History
export interface SpeechRecord {
  id: string;
  date: string;
  duration: number; // seconds
  wordCount: number;
  wpm: number;
  clarityScore: number;
  confidenceScore: number;
  paceScore: number;
  overallScore: number;
  fillerCount: number;
  transcript: string;
  topic?: string;
  aiAnalysis?: string;
  idealSpeech?: string;
}

export const saveSpeechRecord = (record: SpeechRecord): void => {
  const history = getSpeechHistory();
  history.unshift(record); // newest first
  // Keep only last 50 records
  const trimmed = history.slice(0, 50);
  localStorage.setItem(KEYS.SPEECH_HISTORY, JSON.stringify(trimmed));
};

export const getSpeechHistory = (): SpeechRecord[] => {
  const stored = localStorage.getItem(KEYS.SPEECH_HISTORY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const clearSpeechHistory = (): void => {
  localStorage.removeItem(KEYS.SPEECH_HISTORY);
};

export const getSessionId = (): string => {
  let id = localStorage.getItem(KEYS.SESSION_ID);
  if (!id) {
    id = `sb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(KEYS.SESSION_ID, id);
  }
  return id;
};
