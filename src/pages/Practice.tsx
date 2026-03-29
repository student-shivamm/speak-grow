import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleGenerativeAI } from "@google/generative-ai";
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
const DEEPGRAM_WS_URL = "wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&interim_results=true&language=en-US";


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

  const socketRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const transcriptRef = useRef("");
  const interimTranscriptRef = useRef("");

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    interimTranscriptRef.current = interimTranscript;
  }, [interimTranscript]);

  useEffect(() => {
    // Check if browser supports required APIs
    if (!window.MediaRecorder || !window.WebSocket) {
      setIsSupported(false);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (socketRef.current) socketRef.current.close();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    setError(null);
    setTranscript("");
    setInterimTranscript("");
    setElapsed(0);
    audioChunksRef.current = [];

    const API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

    if (!API_KEY) {
      setError("Deepgram API Key is missing. Please add VITE_DEEPGRAM_API_KEY to your .env file.");
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
    } catch (err) {
      setError("Microphone access is required. Please allow permissions in your browser settings.");
      return;
    }

    const socket = new WebSocket(DEEPGRAM_WS_URL, ["token", API_KEY]);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Deepgram connection opened");
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        }
      };

      mediaRecorder.start(250); // Send chunks every 250ms
      setIsRecording(true);
      isRecordingRef.current = true;
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    };

    socket.onmessage = (message) => {
      const received = JSON.parse(message.data);
      if (received.channel && received.channel.alternatives) {
        const alt = received.channel.alternatives[0];
        const text = alt.transcript;

        if (text && received.is_final) {
          setTranscript((prev) => prev + text + " ");
          setInterimTranscript("");
        } else if (text) {
          setInterimTranscript(text);
        }
      }
    };

    socket.onerror = (err) => {
      console.error("Deepgram WebSocket error:", err);
      setError("Transcription service error. Please try again.");
      stopRecording();
    };

    socket.onclose = () => {
      console.log("Deepgram connection closed");
    };

    setCreditConsumed(false);
  };

  const stopRecording = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);

    // Create abort controller for this analysis session
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // GLOBAL SAFETY TIMEOUT: If analysis takes longer than 90s, force-fail
    // This is the ultimate safety net against infinite "Analyzing" state
    safetyTimeoutRef.current = setTimeout(() => {
      console.error("[SpeakGrow] SAFETY TIMEOUT: Analysis exceeded 90 seconds. Force-stopping.");
      abortController.abort();
      setIsAnalyzing(false);
      setError("Analysis took too long and was automatically stopped. Please try again with a shorter recording.");
    }, 90000);

    // Capture refs BEFORE any state changes to avoid stale closures
    const capturedTranscript = transcriptRef.current;
    const capturedInterim = interimTranscriptRef.current;

    if (socketRef.current) {
      try {
        socketRef.current.send(JSON.stringify({ type: 'CloseStream' }));
      } catch(e) { /* socket may already be closed */ }
      socketRef.current.close();
      socketRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setInterimTranscript("");

    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const finalTranscript = (capturedTranscript + " " + capturedInterim).trim() || "No transcript recorded.";

    console.log("[SpeakGrow] [STEP 1/7] Recording stopped. Duration:", duration, "s | Transcript length:", finalTranscript.length, "chars");

    const localAnalysis = analyzeSpeech(finalTranscript, duration);

    if (duration < 10) {
      setError("Recording was too short. Please record for at least 10 seconds.");
      setIsAnalyzing(false);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      return;
    }

    if (finalTranscript.trim().length < 10) {
      if (finalTranscript.trim().length === 0) {
        setError("Speech recognition could not detect any words. Please ensure your microphone is working and you are speaking clearly.");
      } else {
        setError("We couldn't hear you clearly. Please ensure your microphone is picking up your voice and speak a few words.");
      }
      setIsAnalyzing(false);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      return;
    }

    // Check if aborted before proceeding
    if (abortController.signal.aborted) return;

    // Stop media recorder and get audio blob WITH TIMEOUT
    // This is the primary fix: MediaRecorder.onstop can hang forever if the
    // recorder enters an error state without firing onstop.
    console.log("[SpeakGrow] [STEP 2/7] Stopping MediaRecorder...");
    let audioBlob: Blob | null = null;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        const stopPromise = new Promise<Blob>((resolve, reject) => {
          const recorder = mediaRecorderRef.current!;
          // Wire up error handler to prevent silent hangs
          recorder.onerror = (event) => {
            console.error("[SpeakGrow] MediaRecorder error during stop:", event);
            // Still try to create blob from whatever chunks we have
            if (audioChunksRef.current.length > 0) {
              resolve(new Blob(audioChunksRef.current, { type: 'audio/webm' }));
            } else {
              reject(new Error("MediaRecorder error and no audio chunks available."));
            }
          };
          recorder.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            console.log("[SpeakGrow] [STEP 2/7] MediaRecorder stopped. Blob size:", (blob.size / 1024).toFixed(1), "KB");
            resolve(blob);
          };
        });

        // Timeout for MediaRecorder stop: 5 seconds max
        const timeoutPromise = new Promise<Blob>((resolve, reject) => {
          setTimeout(() => {
            console.warn("[SpeakGrow] MediaRecorder.onstop timed out after 5s. Using available chunks.");
            if (audioChunksRef.current.length > 0) {
              resolve(new Blob(audioChunksRef.current, { type: 'audio/webm' }));
            } else {
              reject(new Error("MediaRecorder stop timed out and no audio chunks available."));
            }
          }, 5000);
        });

        mediaRecorderRef.current.stop();
        audioBlob = await Promise.race([stopPromise, timeoutPromise]);
      } catch (recorderErr) {
        console.error("[SpeakGrow] MediaRecorder stop failed:", recorderErr);
      }

      // Stop microphone tracks
      try {
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
      } catch (e) { /* tracks may already be stopped */ }
    } else {
      // MediaRecorder already inactive — try to use collected chunks
      console.warn("[SpeakGrow] MediaRecorder already inactive. Using collected chunks.");
      if (audioChunksRef.current.length > 0) {
        audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      }
    }

    if (!audioBlob || audioBlob.size === 0) {
      setError("Failed to capture audio recording. Please try again.");
      setIsAnalyzing(false);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      return;
    }

    // Check if aborted before proceeding
    if (abortController.signal.aborted) return;

    // Check credits before calling AI
    console.log("[SpeakGrow] [STEP 3/7] Checking auth and credits...");
    if (!session || !profile) {
      setIsAnalyzing(false);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      navigate("/auth");
      return;
    }
    
    if (profile.credits <= 0) {
      setIsAnalyzing(false);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      navigate("/upgrade");
      return;
    }

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Your VITE_GEMINI_API_KEY environment variable is missing! Please add it in your .env file.");
      }

      // Check if aborted before AI calls
      if (abortController.signal.aborted) {
        console.log("[SpeakGrow] Analysis aborted before AI call.");
        return;
      }

      const promptText = `Analyze the following speech transcript AND the provided audio recording. Provide a detailed public speaking evaluation for the topic: "${topic}". Pay close attention to the raw AUDIO to evaluate Pitch, Vocal Energy, Emotions, tone, and hesitations directly from the sound.

IMPORTANT SCORING RULES:
1. Evaluate Clarity, Confidence, Pace, and Overall Score heavily out of 100 accurately based on the actual audio performance.
2. DURATION PENALTY: The IDEAL speech duration is 2-4 minutes. If the speech is severely under time (e.g., less than 1 minute), aggressively penalize the Overall Score (rarely above 50-60 if it's just a few seconds). If it is slightly short, apply a minor penalty.

INPUT:
- Transcript: ${finalTranscript}
- Speech Duration: ${Math.floor(duration / 60)} minutes and ${Math.round(duration % 60)} seconds.
- Actual Speaking Pace: ${localAnalysis.wpm} words per minute (WPM). Note: Ideal pace is 100-160 WPM.

OUTPUT FORMAT:
Provide the response strictly in this exact order format:

<SCORES>
{
  "overallScore": 85,
  "clarityScore": 80,
  "confidenceScore": 85,
  "paceScore": 90
}
</SCORES>

1. EMOTIONAL ANALYSIS & VOCAL TONE
- Describe the emotional tone (e.g., monotone, engaging) and evaluate the energy level (low/high).
- Mention patterns or specific lines where emotion/energy was weak or strong.

2. FILLER WORDS DETECTION
- List all filler words used (e.g., "um", "uh", "like").
- Provide frequency count.
- Show 2–3 exact sentences where filler words were used.

3. PERSONALIZED FEEDBACK
- Give exact, actionable suggestions based on the user's speech.
- Each suggestion must identify the issue, quote the user, and provide a single improved sentence.
- Provide exactly 2 or 3 personalized improvements.

4. OVERALL SUMMARY
- Give a short summary of strengths and key improvement areas.`;

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.7,
        }
      });

      // Convert audio blob to base64 for Gemini multimodal input
      console.log("[SpeakGrow] [STEP 4/7] Converting audio to base64. Blob size:", (audioBlob!.size / 1024).toFixed(1), "KB");
      const audioBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          if (!base64) reject(new Error("Failed to encode audio."));
          else resolve(base64);
        };
        reader.onerror = () => reject(new Error("Failed to read audio file."));
        reader.readAsDataURL(audioBlob!);
      });

      const audioPart = {
        inlineData: {
          data: audioBase64,
          mimeType: audioBlob!.type || 'audio/webm',
        },
      };

      // --- GROQ: Ideal Speech (fire-and-forget, non-blocking) ---
      const grokApiKey = import.meta.env.VITE_GROK_API_KEY;
      const groqPrompt = `Topic: "${topic}"
User Blueprint/Transcript: "${finalTranscript}"

Task: You are an expert public speaking coach. Generate a high-quality, engaging ideal speech (~250-300 words). It should be INSPIRED by the user's actual transcript, retaining their general ideas but making it significantly better with a strong and creative opening, clear deep structure, engaging professional tone, and zero filler words. ONLY output the transcript of the speech, no introductions, greetings, quotes, or formatting.`;

      // Groq has its own independent 20-second timeout so it can never block Gemini
      const groqWithTimeout = (promise: Promise<any>) => {
        const groqTimeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 20000));
        return Promise.race([promise, groqTimeout]);
      };

      const groqPromise = grokApiKey ? groqWithTimeout(
        fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${grokApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: groqPrompt }],
            temperature: 0.7,
            max_tokens: 600
          })
        }).then(res => res.ok ? res.json() : null)
          .catch(err => {
            console.warn("[SpeakGrow] Groq Ideal Speech failed:", err);
            return null;
          })
      ) : Promise.resolve(null);

      // --- GEMINI: Audio Analysis (the critical path) ---
      // Use a generous 45-second timeout since large audio uploads can take time
      console.log("[SpeakGrow] [STEP 5/7] Sending audio to Gemini 2.5 Flash...");
      const geminiPromise = model.generateContent([promptText, audioPart]);

      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("AI analysis timed out. This can happen with longer recordings. Please try again.")), 45000)
      );

      // Also abort if user clicked cancel
      const abortPromise = new Promise<never>((_, reject) => {
        abortController.signal.addEventListener('abort', () => 
          reject(new Error("Analysis was cancelled."))
        );
      });

      // Gemini and Groq run fully independently
      // If Groq fails or times out, we still get Gemini results
      // If Gemini times out, we show an error
      const [analysisResult, groqResult] = await Promise.all([
        Promise.race([geminiPromise, timeoutPromise, abortPromise]),
        groqPromise  // Already has its own 20s timeout, will resolve to null on failure
      ]);
      
      // Check if aborted after API call
      if (abortController.signal.aborted) {
        console.log("[SpeakGrow] Analysis aborted after API response.");
        return;
      }

      console.log("[SpeakGrow] [STEP 5/7] Gemini response received!");
      let responseText: string;
      try {
        responseText = (analysisResult as any).response.text();
      } catch (textErr) {
        console.error("[SpeakGrow] Failed to extract text from Gemini response:", textErr);
        throw new Error("AI returned an empty or blocked response. Please try recording again.");
      }

      // Extract XML SCORES cleanly using JSON.parse
      const scoresMatch = responseText.match(/<SCORES>([\s\S]*?)<\/SCORES>/i);
      if (scoresMatch && scoresMatch[1]) {
        try {
          const scoresJson = JSON.parse(scoresMatch[1].replace(/```json|```/gi, "").trim());
          if (scoresJson.overallScore !== undefined) {
             localAnalysis.overallScore = scoresJson.overallScore;
             localAnalysis.clarityScore = scoresJson.clarityScore;
             localAnalysis.confidenceScore = scoresJson.confidenceScore;
             localAnalysis.paceScore = scoresJson.paceScore;
          }
        } catch (e) {
          console.error("Failed to parse scores JSON", e);
        }
        // Remove the scores block entirely so no raw JSON surfaces in the UI
        responseText = responseText.replace(/<SCORES>[\s\S]*?<\/SCORES>/i, "").trim();
      }

      let aiFeedback = responseText;
      
      // Extract ideal speech from Groq result
      console.log("[SpeakGrow] [STEP 6/7] Groq result:", groqResult ? "received" : "null/failed");
      let idealSpeech = groqResult?.choices?.[0]?.message?.content?.trim() || "";
      
      // If Groq failed, generate ideal speech via Gemini as fallback
      if (!idealSpeech) {
        console.log("[SpeakGrow] Groq returned empty. Generating ideal speech via Gemini fallback...");
        try {
          const fallbackResult = await Promise.race([
            model.generateContent(`Topic: "${topic}"\nUser transcript: "${finalTranscript}"\n\nGenerate a high-quality, engaging ideal speech (~250-300 words) INSPIRED by the user's transcript. Retain their general ideas but make it significantly better with a strong opening, clear structure, engaging tone, and no filler words. ONLY output the speech text, nothing else.`),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 15000))
          ]);
          if (fallbackResult && (fallbackResult as any).response) {
            idealSpeech = (fallbackResult as any).response.text().trim();
            console.log("[SpeakGrow] Gemini fallback ideal speech generated successfully!");
          }
        } catch (e) {
          console.warn("[SpeakGrow] Gemini fallback for ideal speech also failed:", e);
        }
      }

      // Handle combo emotional analysis block
      let emotionalTone = "";
      let vocalEnergy = ""; // Empty so the separate UI section remains hidden
      const emotionalComboMatch = aiFeedback.match(/1\.?\s*EMOTIONAL ANALYSIS(.*?)2\.?\s*FILLER/is);
      if (emotionalComboMatch && emotionalComboMatch[1]) {
        emotionalTone = emotionalComboMatch[1].trim();
      }

      // Update local analysis with AI results
      localAnalysis.aiAnalysis = aiFeedback;
      localAnalysis.idealSpeech = idealSpeech;
      localAnalysis.emotionalTone = emotionalTone;
      localAnalysis.vocalEnergy = vocalEnergy;

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
        aiAnalysis: aiFeedback,
        idealSpeech: idealSpeech,
        emotionalTone: emotionalTone,
        vocalEnergy: vocalEnergy,
      };

      // Consume credit in Supabase now that analysis succeeded
      console.log("[SpeakGrow] [STEP 7/7] Analysis complete. Consuming credit and navigating...");
      if (session && profile) {
        const newCredits = profile.credits - 1;
        const { error: dbError } = await supabase
          .from('users')
          .update({ credits: newCredits })
          .eq('id', session.user.id);

        if (!dbError) {
          await refreshProfile();
        }
      }
      setCreditConsumed(true);

      saveSpeechRecord(record);
      setLastAnalysis({ ...record, analysis: localAnalysis } as any);

      // Clear safety timeout since we succeeded
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

      // Navigate to feedback (resetting state first)
      setIsAnalyzing(false);
      navigate("/feedback", { state: { analysis: localAnalysis, record } });
    } catch (err: any) {
      // Clear safety timeout on error too
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

      // Don't show error if user explicitly cancelled
      if (abortController.signal.aborted) {
        console.log("[SpeakGrow] Analysis was cancelled by user.");
        setIsAnalyzing(false);
        return;
      }

      console.error("[SpeakGrow] AI Analysis Failed:", err);
      setIsAnalyzing(false);
      
      const msg = err?.message || "";
      if (msg.includes("timed out")) {
        setError("AI analysis timed out — this can happen with longer recordings or slow connections. Please try again.");
      } else if (msg.includes("API_KEY")) {
        setError(msg);
      } else if (msg.includes("empty or blocked")) {
        setError(msg);
      } else {
        setError("AI analysis failed: " + (msg || "Please check your internet connection and try again."));
      }
    }
  }, [creditConsumed, navigate, setLastAnalysis, topic, session, profile, refreshProfile]);

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

            {/* Wait hint while analyzing */}
            {isAnalyzing && (
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs text-muted-foreground/70 italic text-center max-w-xs">
                  ⏳ Analyzing your speech with AI... This typically takes 15–30 seconds.
                </p>
                <button
                  onClick={() => {
                    // Actually abort in-flight API calls
                    if (abortControllerRef.current) {
                      abortControllerRef.current.abort();
                    }
                    if (safetyTimeoutRef.current) {
                      clearTimeout(safetyTimeoutRef.current);
                    }
                    setIsAnalyzing(false);
                    setError("Analysis was cancelled. You can try recording again.");
                  }}
                  className="text-xs text-muted-foreground hover:text-error underline transition-colors"
                >
                  Cancel analysis
                </button>
              </div>
            )}

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
