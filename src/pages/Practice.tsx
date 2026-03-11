import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Square, Shuffle, Timer, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { useCreditStore } from "@/store/creditStore";
import { supabase } from "@/integrations/supabase/client";
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
  const { profile, session, refreshProfile } = useAuthStore();
  const { setLastAnalysis } = useCreditStore();

  const credits = profile ? profile.credits : 0;

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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const isRecordingRef = useRef(false);
  const isAnalyzingRef = useRef(false);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    isAnalyzingRef.current = isAnalyzing;
  }, [isAnalyzing]);

  const startRecording = async () => {
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
    audioChunksRef.current = [];

    let stream: MediaStream;
    try {
      // Explicitly request microphone access to trigger the browser prompt
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      setError("Microphone access is required to use this feature. Please allow permissions in your browser settings.");
      return;
    }

    try {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Failed to start MediaRecorder:", err);
    }

    const recognition = new SR() as unknown as SpeechRecognition;
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
      const cleanup = () => {
        isRecordingRef.current = false;
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
      };

      if (event.error === "not-allowed") {
        setError("Microphone access was denied. Please allow microphone permissions.");
        cleanup();
      } else if (event.error === "no-speech") {
        // ignore
      } else {
        setError(`Speech recognition error: ${event.error}`);
        cleanup();
      }
    };

    recognition.onend = () => {
      if (isRecordingRef.current && !isAnalyzingRef.current) {
        try { recognition.start(); } catch { }
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

  const stopRecording = useCallback(async () => {
    setIsAnalyzing(true);
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setInterimTranscript("");

    const finalTranscript = transcript + interimTranscript;
    const duration = elapsed;

    if (duration < 10) {
      setError("Recording was too short. Please record for at least 10 seconds.");
      setIsAnalyzing(false);
      return;
    }

    if (finalTranscript.trim().length < 10) {
      setError("We couldn't hear you clearly. Please ensure your microphone is picking up your voice and speak a few words.");
      setIsAnalyzing(false);
      return;
    }

    // Stop media recorder and get audio blob
    let audioBlob: Blob | null = null;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      const stopPromise = new Promise<Blob>((resolve) => {
        mediaRecorderRef.current!.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          resolve(blob);
        };
      });
      mediaRecorderRef.current.stop();
      audioBlob = await stopPromise;
      // Stop microphone tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    if (!audioBlob) {
      setError("Failed to capture audio recording. Please try again.");
      setIsAnalyzing(false);
      return;
    }

    // Consume credit in Supabase
    if (session && profile) {
      const newCredits = profile.credits - 1;
      if (newCredits < 0) {
        navigate("/upgrade");
        return;
      }
      const { error: dbError } = await supabase
        .from('users')
        .update({ credits: newCredits })
        .eq('id', session.user.id);

      if (!dbError) {
        await refreshProfile();
      }
    } else {
      navigate("/auth");
      return;
    }
    setCreditConsumed(true);

    try {
      // Send audio to n8n webhook
      const formData = new FormData();
      formData.append("Your_input_audio", audioBlob, "speech.ogg");

      const response = await fetch("https://shivambajaj870.app.n8n.cloud/webhook/92f4cb35-13ab-4a2a-8f11-ed88c7be0180", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.statusText}`);
      }

      // Expected JSON response from the webhook: { analysis: "AI string" }
      const webhookData: any = await response.json();
      const aiFeedback = webhookData.analysis || "No AI feedback received.";

      // Calculate local fallback stats so the UI doesn't show 0s
      const localAnalysis = analyzeSpeech(finalTranscript, duration);
      localAnalysis.aiAnalysis = aiFeedback;

      const record: SpeechRecord = {
        id: `speech_${Date.now()}`,
        date: new Date().toISOString(),
        duration,
        wordCount: localAnalysis.wordCount,
        wpm: localAnalysis.wpm,
        clarityScore: localAnalysis.clarityScore,
        confidenceScore: localAnalysis.confidenceScore,
        paceScore: localAnalysis.paceScore,
        overallScore: localAnalysis.overallScore,
        fillerCount: localAnalysis.totalFillerCount,
        transcript: finalTranscript,
        topic,
      };

      saveSpeechRecord(record);
      setLastAnalysis({ ...record, analysis: localAnalysis } as any);

      // Navigate to feedback
      navigate("/feedback", { state: { analysis: localAnalysis, record } });
    } catch (err: any) {
      console.error("AI Analysis Failed:", err);
      setError("AI analysis failed. Please check your internet connection and webhook status.");

      // Fallback: restore credit if analysis fails
      // Note: A real app would track credits more securely on the backend
      setIsAnalyzing(false);
    }
  }, [transcript, interimTranscript, elapsed, creditConsumed, navigate, setLastAnalysis, topic, session, profile, refreshProfile]);

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
                className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-brand ${isRecording
                  ? "gradient-accent glow-pulse"
                  : "gradient-brand"
                  }`}
              >
                {isAnalyzing ? (
                  <div className="h-10 w-10 border-4 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : isRecording ? (
                  <Square className="h-10 w-10 text-primary-foreground" fill="currentColor" />
                ) : (
                  <Mic className="h-10 w-10 text-primary-foreground" />
                )}
              </motion.button>
            </div>

            <p className="text-sm text-muted-foreground">
              {isAnalyzing ? "Analyzing speech with AI..." : isRecording ? "Click to stop and analyze" : credits > 0 ? "Click to start recording" : "Purchase credits to continue"}
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
