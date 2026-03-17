// Speech Analysis Engine

const FILLER_WORDS = [
  "um", "uh", "like", "you know", "basically", "actually",
  "literally", "kind of", "sort of", "right", "okay so",
  "i mean", "you see", "well", "so yeah",
];

export interface FillerWordResult {
  word: string;
  count: number;
  positions: number[];
}

export interface SpeechAnalysisResult {
  overallScore: number;
  clarityScore: number;
  confidenceScore: number;
  paceScore: number;
  wpm: number;
  paceCategory: "slow" | "ideal" | "fast";
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  fillerWords: FillerWordResult[];
  totalFillerCount: number;
  fillerPercentage: number;
  vocabularyDiversity: number; // unique words / total words
  structure: StructureAnalysis;
  suggestions: string[];
  highlightedTranscript: string;
  aiAnalysis?: string;
  idealSpeech?: string;
}

export interface StructureAnalysis {
  hasIntroduction: boolean;
  hasBody: boolean;
  hasConclusion: boolean;
  structureScore: number;
  introductionPhrases: string[];
  bodyPhrases: string[];
  conclusionPhrases: string[];
}

const INTRO_PHRASES = [
  "today i want to", "today i'd like to", "let me begin",
  "i'm here to", "i want to talk about", "let's start with",
  "good morning", "good afternoon", "good evening", "hello everyone",
  "thank you for", "welcome to", "i'd like to introduce",
];

const BODY_PHRASES = [
  "first", "second", "third", "firstly", "secondly", "thirdly",
  "next", "then", "another", "furthermore", "additionally", "moreover",
  "in addition", "also", "besides", "for example", "for instance",
  "to illustrate", "specifically",
];

const CONCLUSION_PHRASES = [
  "in conclusion", "to conclude", "to summarize", "in summary",
  "finally", "to wrap up", "in closing", "as i mentioned",
  "to end", "let me close", "thank you", "to recap",
];

export const analyzeFillerWords = (transcript: string): FillerWordResult[] => {
  const lower = transcript.toLowerCase();
  const results: FillerWordResult[] = [];

  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler.replace(/\s+/g, "\\s+")}\\b`, "gi");
    const matches = [...lower.matchAll(regex)];
    if (matches.length > 0) {
      results.push({
        word: filler,
        count: matches.length,
        positions: matches.map((m) => m.index || 0),
      });
    }
  }

  return results.sort((a, b) => b.count - a.count);
};

export const highlightFillerWords = (transcript: string): string => {
  let highlighted = transcript;
  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b(${filler.replace(/\s+/g, "\\s+")})\\b`, "gi");
    highlighted = highlighted.replace(
      regex,
      '<mark class="bg-warning/30 text-warning rounded px-0.5 font-medium">$1</mark>'
    );
  }
  return highlighted;
};

export const analyzeStructure = (transcript: string): StructureAnalysis => {
  const lower = transcript.toLowerCase();

  const foundIntro = INTRO_PHRASES.filter((p) => lower.includes(p));
  const foundBody = BODY_PHRASES.filter((p) =>
    new RegExp(`\\b${p}\\b`).test(lower)
  );
  const foundConclusion = CONCLUSION_PHRASES.filter((p) => lower.includes(p));

  const hasIntroduction = foundIntro.length > 0;
  const hasBody = foundBody.length >= 2;
  const hasConclusion = foundConclusion.length > 0;

  const structureScore =
    (hasIntroduction ? 33 : 0) +
    (hasBody ? 34 : 0) +
    (hasConclusion ? 33 : 0);

  return {
    hasIntroduction,
    hasBody,
    hasConclusion,
    structureScore,
    introductionPhrases: foundIntro,
    bodyPhrases: foundBody,
    conclusionPhrases: foundConclusion,
  };
};

export const analyzeSpeech = (
  transcript: string,
  durationSeconds: number
): SpeechAnalysisResult => {
  if (!transcript.trim()) {
    return getEmptyResult();
  }

  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const durationMinutes = Math.max(durationSeconds / 60, 0.1);
  const wpm = Math.round(wordCount / durationMinutes);

  // Sentences
  const sentences = transcript.split(/[.!?]+/).filter((s) => s.trim().length > 5);
  const sentenceCount = Math.max(sentences.length, 1);
  const avgWordsPerSentence = wordCount / sentenceCount;

  // Filler words
  const fillerWords = analyzeFillerWords(transcript);
  const totalFillerCount = fillerWords.reduce((sum, fw) => sum + fw.count, 0);
  const fillerPercentage = wordCount > 0 ? (totalFillerCount / wordCount) * 100 : 0;

  // Vocabulary diversity
  const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z]/g, "")));
  const vocabularyDiversity = uniqueWords.size / Math.max(wordCount, 1);

  // Structure
  const structure = analyzeStructure(transcript);

  // PACE SCORE
  let paceCategory: "slow" | "ideal" | "fast";
  let paceScore: number;
  if (wpm < 100) {
    paceCategory = "slow";
    paceScore = Math.max(40, (wpm / 100) * 70);
  } else if (wpm <= 160) {
    paceCategory = "ideal";
    paceScore = 85 + ((wpm - 100) / 60) * 15;
    if (wpm > 140) paceScore = 100 - ((wpm - 140) / 20) * 15;
  } else {
    paceCategory = "fast";
    paceScore = Math.max(40, 85 - ((wpm - 160) / 40) * 45);
  }
  paceScore = Math.round(Math.min(100, Math.max(0, paceScore)));

  // CLARITY SCORE
  let clarityScore = 70;
  // Better vocabulary diversity → higher clarity
  clarityScore += vocabularyDiversity * 20;
  // Shorter sentences are clearer
  if (avgWordsPerSentence <= 15) clarityScore += 10;
  else if (avgWordsPerSentence > 25) clarityScore -= 15;
  // Fewer fillers → higher clarity
  clarityScore -= fillerPercentage * 2;
  // Structure bonus
  clarityScore += structure.structureScore * 0.1;
  clarityScore = Math.round(Math.min(100, Math.max(0, clarityScore)));

  // CONFIDENCE SCORE
  let confidenceScore = 65;
  // Ideal pace shows confidence
  if (paceCategory === "ideal") confidenceScore += 20;
  else if (paceCategory === "slow") confidenceScore += 5;
  // Few fillers = confident
  if (totalFillerCount === 0) confidenceScore += 15;
  else if (totalFillerCount <= 3) confidenceScore += 8;
  else confidenceScore -= Math.min(15, totalFillerCount * 2);
  // More words = completed speech
  if (wordCount > 100) confidenceScore += 10;
  confidenceScore = Math.round(Math.min(100, Math.max(0, confidenceScore)));

  // OVERALL SCORE
  const overallScore = Math.round(
    clarityScore * 0.35 + confidenceScore * 0.35 + paceScore * 0.3
  );

  // SUGGESTIONS
  const suggestions: string[] = [];
  if (paceCategory === "slow") suggestions.push("Try speaking a bit faster — aim for 120–150 words per minute for better engagement.");
  if (paceCategory === "fast") suggestions.push("Slow down! Speaking too fast makes it hard for the audience to follow.");
  if (totalFillerCount > 5) suggestions.push(`You used ${totalFillerCount} filler words. Practice pausing instead of saying "um" or "uh".`);
  if (!structure.hasIntroduction) suggestions.push("Add a clear opening statement to grab your audience's attention.");
  if (!structure.hasConclusion) suggestions.push("End with a clear conclusion — summarize your main points.");
  if (!structure.hasBody) suggestions.push("Use transition words (first, second, next) to structure your speech body.");
  if (avgWordsPerSentence > 25) suggestions.push("Try breaking long sentences into shorter, punchier statements.");
  if (vocabularyDiversity < 0.4) suggestions.push("Vary your vocabulary to make your speech more engaging.");
  if (wordCount < 50) suggestions.push("Try to speak for longer — a good practice speech is at least 2–3 minutes.");
  if (overallScore >= 80) suggestions.push("Excellent speech! Challenge yourself with a more complex topic next time.");

  if (suggestions.length === 0) suggestions.push("Great work! Keep practicing to further refine your speaking skills.");

  return {
    overallScore,
    clarityScore,
    confidenceScore,
    paceScore,
    wpm,
    paceCategory,
    wordCount,
    sentenceCount,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    fillerWords,
    totalFillerCount,
    fillerPercentage: Math.round(fillerPercentage * 10) / 10,
    vocabularyDiversity: Math.round(vocabularyDiversity * 100) / 100,
    structure,
    suggestions,
    highlightedTranscript: highlightFillerWords(transcript),
  };
};

const getEmptyResult = (): SpeechAnalysisResult => ({
  overallScore: 0,
  clarityScore: 0,
  confidenceScore: 0,
  paceScore: 0,
  wpm: 0,
  paceCategory: "slow",
  wordCount: 0,
  sentenceCount: 0,
  avgWordsPerSentence: 0,
  fillerWords: [],
  totalFillerCount: 0,
  fillerPercentage: 0,
  vocabularyDiversity: 0,
  structure: {
    hasIntroduction: false,
    hasBody: false,
    hasConclusion: false,
    structureScore: 0,
    introductionPhrases: [],
    bodyPhrases: [],
    conclusionPhrases: [],
  },
  suggestions: ["No speech detected. Please try again."],
  highlightedTranscript: "",
});
