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

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

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
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({ type: 'CloseStream' }));
      socketRef.current.close();
      socketRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setInterimTranscript("");

    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const finalTranscript = (transcriptRef.current + " " + interimTranscript).trim() || "No transcript recorded.";

    const localAnalysis = analyzeSpeech(finalTranscript, duration);

    if (duration < 10) {
      setError("Recording was too short. Please record for at least 10 seconds.");
      setIsAnalyzing(false);
      return;
    }

    if (finalTranscript.trim().length < 10) {
      if (finalTranscript.trim().length === 0) {
        setError("Speech recognition could not detect any words. Please ensure your microphone is working and you are speaking clearly.");
      } else {
        setError("We couldn't hear you clearly. Please ensure your microphone is picking up your voice and speak a few words.");
      }
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

    // Check credits before calling AI
    if (!session || !profile) {
      navigate("/auth");
      return;
    }
    
    if (profile.credits <= 0) {
      navigate("/upgrade");
      return;
    }

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Your VITE_GEMINI_API_KEY environment variable is missing! Please add it in your .env file.");
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
      const audioBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(audioBlob!);
      });

      const audioPart = {
        inlineData: {
          data: audioBase64,
          mimeType: audioBlob!.type || 'audio/webm',
        },
      };

      const grokApiKey = import.meta.env.VITE_GROK_API_KEY;
      const groqPrompt = `Topic: "${topic}"
User Blueprint/Transcript: "${finalTranscript}"

Task: You are an expert public speaking coach. Generate a high-quality, engaging ideal speech (~250-300 words). It should be INSPIRED by the user's actual transcript, retaining their general ideas but making it significantly better with a strong and creative opening, clear deep structure, engaging professional tone, and zero filler words. ONLY output the transcript of the speech, no introductions, greetings, quotes, or formatting.`;
      const groqPromise = grokApiKey ? fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${grokApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [{ role: "user", content: groqPrompt }],
          temperature: 0.7,
          max_tokens: 600
        })
      }).then(res => res.ok ? res.json() : null)
        .catch(err => {
          console.warn("Groq Ideal Speech failed:", err);
          return null;
        }) : Promise.resolve(null);

      // Ensure the UI never hangs forever by enforcing a strict 25-second timeout limit
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timed out after 25 seconds. Please try again.")), 25000)
      );

      // Fire both requests concurrently (Gemini for audio, Groq for long ideal text)
      // We wrap the Gemini call in its own catch so it doesn't fail the whole block
      const [analysisResult, groqResult] = await Promise.race([
        Promise.all([
          model.generateContent([promptText, audioPart]).catch(e => { throw e; }),
          groqPromise
        ]),
        timeoutPromise
      ]) as [any, any];
      
      let responseText = analysisResult.response.text();

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
      let idealSpeech = groqResult?.choices?.[0]?.message?.content?.trim() || "";

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

      // Navigate to feedback (resetting state first)
      setIsAnalyzing(false);
      navigate("/feedback", { state: { analysis: localAnalysis, record } });
    } catch (err: any) {
      console.error("AI Analysis Failed:", err);
      setIsAnalyzing(false);
      
      if (err.name === 'AbortError') {
        setError("AI Analysis timed out. Please try again.");
      } else {
        setError("AI analysis failed: " + (err.message || "Please check your internet connection and try again."));
      }
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

            {/* Wait hint while analyzing */}
            {isAnalyzing && (
              <p className="text-xs text-muted-foreground/70 italic text-center max-w-xs">
                ⏳ This may take 15–30 seconds. Please don't close the page.
              </p>
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
