import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, TrendingUp, Target, Zap, MessageSquare, CheckCircle, XCircle, Lightbulb, BarChart2, Star, Sparkles, Heart, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import type { SpeechAnalysisResult } from "@/lib/speechAnalysis";
import type { SpeechRecord } from "@/lib/localStorage";

interface FeedbackState {
  analysis: SpeechAnalysisResult;
  record: SpeechRecord;
}

const ScoreCard = ({ label, score, color, icon: Icon }: { label: string; score: number; color: string; icon: React.ElementType }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-card rounded-2xl p-5 shadow-card border border-border text-center card-hover"
  >
    <div className={`w-10 h-10 rounded-xl ${color} bg-opacity-10 flex items-center justify-center mx-auto mb-3`}>
      <Icon className={`h-5 w-5 ${color}`} />
    </div>
    <div className={`text-3xl font-display font-bold ${color} mb-1`}>{score}</div>
    <div className="text-xs text-muted-foreground font-medium">{label}</div>
    <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1, delay: 0.5 }}
        className={`h-full rounded-full ${color.replace("text-", "bg-")}`}
      />
    </div>
  </motion.div>
);

const FeedbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as FeedbackState | null;

  useEffect(() => {
    if (!state) navigate("/practice");
  }, [state, navigate]);

  if (!state) return null;

  const { analysis, record } = state;

  const boldHeadings = (text: string) => {
    if (!text) return "";
    // Detects lines starting with A. B. C. or 1. 2. 3. and bolds the heading part
    // Matches: "A. Heading: " or "1. Heading: " or "1. HEADING CONTENT"
    return text.replace(/^(\d+\.|[A-Z]\.)\s+(.*?)([:\n]|$)/gm, (match, prefix, content, suffix) => {
      // If it's already bold, don't double bold
      if (content.startsWith("**")) return match;
      return `${prefix} **${content}**${suffix}`;
    });
  };

  const paceColor =
    analysis.paceCategory === "ideal" ? "text-success" :
      analysis.paceCategory === "slow" ? "text-warning" : "text-error";

  const paceLabel =
    analysis.paceCategory === "ideal" ? "Ideal Pace" :
      analysis.paceCategory === "slow" ? "Too Slow" : "Too Fast";

  const overallColor =
    analysis.overallScore >= 80 ? "text-success" :
      analysis.overallScore >= 60 ? "text-primary" : "text-warning";

  const scoreData = [
    { name: "Score", value: analysis.overallScore, fill: "#4F46E5" },
  ];

  const pieData = [
    { name: "Clarity", value: analysis.clarityScore, color: "#06B6D4" },
    { name: "Confidence", value: analysis.confidenceScore, color: "#4F46E5" },
    { name: "Pace", value: analysis.paceScore, color: "#6D28D9" },
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/practice")} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Practice Again
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold">Speech Analysis</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(record.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              {record.topic && ` · ${record.topic}`}
            </p>
          </div>
        </div>

        {/* Overall Score Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-6 shadow-brand border border-border mb-6 overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          <div className="relative flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0 text-center">
              <div className={`text-6xl font-display font-bold ${overallColor}`}>{analysis.overallScore}</div>
              <div className="text-sm text-muted-foreground font-medium">Overall Score</div>
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {[
                { label: "Words", value: analysis.wordCount },
                { label: "WPM", value: analysis.wpm },
                { label: "Duration", value: `${Math.floor(record.duration / 60)}m ${record.duration % 60}s` },
                { label: "Fillers Detected", value: analysis.totalFillerCount > 0 ? "Yes" : "No" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-xl font-display font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Score Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <ScoreCard label="Clarity Score" score={analysis.clarityScore} color="text-accent" icon={Target} />
          <ScoreCard label="Confidence Score" score={analysis.confidenceScore} color="text-primary" icon={TrendingUp} />
          <ScoreCard label="Pace Score" score={analysis.paceScore} color={paceColor} icon={Zap} />
        </div>

        {/* Pace & Filler Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Pace */}
          <Card className="p-5 shadow-card">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" />
              Speech Pace
            </h3>
            <div className="flex items-center gap-4">
              <div>
                <div className={`text-3xl font-display font-bold ${paceColor}`}>{analysis.wpm}</div>
                <div className="text-xs text-muted-foreground">words per minute</div>
              </div>
              <Badge className={`${analysis.paceCategory === "ideal" ? "bg-success/10 text-success border-success/20" :
                analysis.paceCategory === "slow" ? "bg-warning/10 text-warning border-warning/20" :
                  "bg-error/10 text-error border-error/20"
                }`}>
                {paceLabel}
              </Badge>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Ideal pace: 100–160 WPM for engaging delivery
            </div>
          </Card>

          {/* Filler Words */}
          <Card className="p-5 shadow-card">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-warning" />
              Filler Words
            </h3>
            {analysis.fillerWords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analysis.fillerWords.slice(0, 8).map((fw) => (
                  <Badge key={fw.word} variant="outline" className="text-xs bg-warning/10 border-warning/20 text-warning">
                    "{fw.word}"
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-success text-sm">
                <CheckCircle className="h-4 w-4" />
                No filler words detected! Great job.
              </div>
            )}
          </Card>
        </div>

        {/* Vocal Energy */}
        {analysis.vocalEnergy && (
          <div className="mb-6">
            <Card className="p-5 shadow-card bg-accent/5 border-accent/10">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-accent">
                <Activity className="h-4 w-4" />
                Vocal Energy
              </h3>
              <div className="text-sm text-foreground/90 leading-relaxed prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysis.vocalEnergy}</ReactMarkdown>
              </div>
            </Card>
          </div>
        )}

        {/* Speech Structure */}
        <Card className="p-5 shadow-card mb-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-primary" />
            Speech Structure Analysis
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Introduction", found: analysis.structure.hasIntroduction, phrases: analysis.structure.introductionPhrases },
              { label: "Body", found: analysis.structure.hasBody, phrases: analysis.structure.bodyPhrases },
              { label: "Conclusion", found: analysis.structure.hasConclusion, phrases: analysis.structure.conclusionPhrases },
            ].map((part) => (
              <div key={part.label} className="text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${part.found ? "bg-success/10" : "bg-error/10"
                  }`}>
                  {part.found ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-error" />
                  )}
                </div>
                <div className="text-sm font-medium">{part.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {part.found ? `${part.phrases.length} phrase${part.phrases.length !== 1 ? "s" : ""}` : "Not detected"}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Insights & Suggestions */}
        <Card className="p-6 shadow-card mb-6 bg-gradient-to-br from-card to-muted/30 border-primary/20">
          <h3 className="text-base font-display font-bold mb-4 flex items-center gap-2 text-primary">
            <Lightbulb className="h-5 w-5 text-warning fill-warning/20" />
            AI Speech Insights
          </h3>

          {analysis.idealSpeech && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full mb-6 border-accent/30 bg-accent/5 hover:bg-accent/10 text-accent gap-2 group">
                  <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
                  View Model Speech (200 Words)
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-primary">
                    <Star className="h-5 w-5 text-warning fill-warning/20" />
                    Ideal Speech: {record.topic || "This Topic"}
                  </DialogTitle>
                  <DialogDescription>
                    A professionally crafted version of how this speech could be delivered.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{boldHeadings(analysis.idealSpeech || "")}</ReactMarkdown>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {analysis.aiAnalysis ? (
            <div className="text-sm text-foreground prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-p:leading-relaxed prose-headings:font-display prose-headings:font-bold prose-headings:text-primary prose-headings:mt-3 prose-headings:mb-1 prose-a:text-accent prose-li:marker:text-primary prose-hr:my-3">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{boldHeadings(analysis.aiAnalysis)}</ReactMarkdown>
            </div>
          ) : (
            <div className="space-y-3">
              {analysis.suggestions.map((suggestion, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-background border border-border"
                >
                  <div className="w-5 h-5 rounded-full gradient-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-foreground text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{suggestion}</p>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Transcript */}
        <Card className="p-5 shadow-card mb-6">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            Transcript
            <Badge variant="outline" className="text-xs ml-auto">Filler words highlighted</Badge>
          </h3>
          <div
            className="text-sm leading-relaxed text-foreground max-h-48 overflow-y-auto p-3 bg-muted/30 rounded-xl"
            dangerouslySetInnerHTML={{ __html: analysis.highlightedTranscript }}
          />
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/practice" className="flex-1">
            <Button className="w-full gradient-brand shadow-brand gap-2">
              Practice Again
            </Button>
          </Link>
          <Link to="/progress" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <TrendingUp className="h-4 w-4" />
              View Progress
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
