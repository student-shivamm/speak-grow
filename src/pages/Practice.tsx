import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Square, Shuffle, Timer, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCreditStore } from "@/store/creditStore";
import { analyzeSpeech } from "@/lib/speechAnalysis";
import { saveSpeechRecord } from "@/lib/localStorage";
import { getRandomTopic } from "@/data/topics";
import type { SpeechRecord } from "@/lib/localStorage";

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

const PracticePage = () => {
  const navigate = useNavigate();
  const { credits, consumeCredit, setLastAnalysis } = useCreditStore();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [topic, setTopic] = useState(getRandomTopic());
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [creditConsumed, setCreditConsumed] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setIsSupported(false);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const startRecording = () => {
    if (credits <= 0 && !creditConsumed) {
      navigate("/upgrade");
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    setError(null);
    setTranscript("");
    setInterimTranscript("");
    setElapsed(0);

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let final = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += text + " ";
        } else {
          interim += text;
        }
      }
      if (final) setTranscript((prev) => prev + final);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setError("Microphone access was denied. Please allow microphone permissions.");
      } else if (event.error === "no-speech") {
        // ignore
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      if (isRecording) {
        try { recognition.start(); } catch {}
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setCreditConsumed(false);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  };

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setInterimTranscript("");

    const finalTranscript = transcript + interimTranscript;
    const duration = elapsed;

    if (finalTranscript.trim().length < 10) {
      setError("Speech was too short. Please speak for at least 10 seconds.");
      return;
    }

    // Consume credit
    const success = consumeCredit();
    if (!success && !creditConsumed) {
      navigate("/upgrade");
      return;
    }
    setCreditConsumed(true);

    // Analyze
    const analysis = analyzeSpeech(finalTranscript, duration);

    const record: SpeechRecord = {
      id: `speech_${Date.now()}`,
      date: new Date().toISOString(),
      duration,
      wordCount: analysis.wordCount,
      wpm: analysis.wpm,
      clarityScore: analysis.clarityScore,
      confidenceScore: analysis.confidenceScore,
      paceScore: analysis.paceScore,
      overallScore: analysis.overallScore,
      fillerCount: analysis.totalFillerCount,
      transcript: finalTranscript,
      topic,
    };

    saveSpeechRecord(record);
    setLastAnalysis({ ...record, analysis } as any);

    // Navigate to feedback
    navigate("/feedback", { state: { analysis, record } });
  }, [transcript, interimTranscript, elapsed, consumeCredit, creditConsumed, navigate, setLastAnalysis, topic]);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Speech Practice</h1>
          <p className="text-muted-foreground">Press the microphone to start, speak naturally, then stop to get feedback.</p>
        </div>

        {/* Credits Warning */}
        {credits <= 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 text-error mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-error">No credits remaining</p>
              <p className="text-xs text-muted-foreground mt-0.5">Purchase more credits to continue practicing.</p>
              <button onClick={() => navigate("/upgrade")} className="text-xs text-primary font-medium mt-1 hover:underline">
                Upgrade now →
              </button>
            </div>
          </motion.div>
        )}

        {!isSupported && (
          <div className="mb-6 p-4 rounded-xl bg-warning/10 border border-warning/20 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">Browser Not Supported</p>
              <p className="text-xs text-muted-foreground mt-0.5">Please use Chrome, Edge, or Safari for speech recognition.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-sm text-error">
            {error}
          </div>
        )}

        {/* Topic Card */}
        <Card className="p-5 mb-6 border-border shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Today's Topic</p>
              <p className="text-base font-semibold">{topic}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTopic(getRandomTopic())}
              disabled={isRecording}
              className="flex-shrink-0 gap-1.5"
            >
              <Shuffle className="h-4 w-4" />
              New Topic
            </Button>
          </div>
        </Card>

        {/* Main Recording UI */}
        <Card className="p-8 shadow-card border-border mb-6">
          <div className="flex flex-col items-center gap-6">
            {/* Timer */}
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span className={`text-2xl font-mono font-bold ${isRecording ? "text-accent" : "text-muted-foreground"}`}>
                {formatTime(elapsed)}
              </span>
              {isRecording && (
                <Badge className="bg-error/10 text-error border-error/20 animate-pulse">
                  ● LIVE
                </Badge>
              )}
            </div>

            {/* Microphone Button */}
            <div className="relative">
              {isRecording && (
                <>
                  <div className="absolute inset-0 rounded-full bg-accent/20 animate-ripple scale-150" />
                  <div className="absolute inset-0 rounded-full bg-accent/10 animate-ripple scale-125 [animation-delay:0.5s]" />
                </>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!isSupported || credits <= 0}
                className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-brand ${
                  isRecording
                    ? "gradient-accent glow-pulse"
                    : "gradient-brand"
                }`}
              >
                {isRecording ? (
                  <Square className="h-10 w-10 text-primary-foreground" fill="currentColor" />
                ) : (
                  <Mic className="h-10 w-10 text-primary-foreground" />
                )}
              </motion.button>
            </div>

            <p className="text-sm text-muted-foreground">
              {isRecording ? "Click to stop and analyze" : credits > 0 ? "Click to start recording" : "Purchase credits to continue"}
            </p>

            {/* Credits display */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-accent" />
              <span>{credits} credit{credits !== 1 ? "s" : ""} remaining</span>
            </div>
          </div>
        </Card>

        {/* Transcript Panel */}
        <Card className="shadow-card border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold">Live Transcript</h3>
            {(transcript || interimTranscript) && (
              <Badge variant="outline" className="text-xs">
                {(transcript + " " + interimTranscript).trim().split(/\s+/).filter(Boolean).length} words
              </Badge>
            )}
          </div>
          <div className="p-4 min-h-[160px] max-h-60 overflow-y-auto">
            {transcript || interimTranscript ? (
              <p className="text-sm leading-relaxed text-foreground">
                {transcript}
                <span className="text-muted-foreground">{interimTranscript}</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground text-center mt-8">
                {isRecording ? "Listening... speak clearly into your microphone" : "Your transcription will appear here"}
              </p>
            )}
          </div>
        </Card>

        {/* Tips */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { tip: "Speak at 120–150 WPM for best clarity" },
            { tip: "Use transitions like 'first', 'next', 'finally'" },
            { tip: "Pause instead of using filler words" },
          ].map((t, i) => (
            <div key={i} className="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground text-center">
              💡 {t.tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PracticePage;
