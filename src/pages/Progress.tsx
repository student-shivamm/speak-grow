import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Mic, BarChart2, Calendar, Target, Zap, Clock, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from "recharts";
import { getSpeechHistory } from "@/lib/localStorage";

const ProgressPage = () => {
  const history = useMemo(() => getSpeechHistory(), []);

  const chartData = history
    .slice(0, 10)
    .reverse()
    .map((record, i) => ({
      name: `#${i + 1}`,
      date: new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      Clarity: record.clarityScore,
      Confidence: record.confidenceScore,
      Pace: record.paceScore,
      Overall: record.overallScore,
      WPM: record.wpm,
      Fillers: record.fillerCount,
    }));

  const avgScore = history.length
    ? Math.round(history.reduce((sum, r) => sum + r.overallScore, 0) / history.length)
    : 0;

  const bestScore = history.length ? Math.max(...history.map((r) => r.overallScore)) : 0;
  const totalSpeeches = history.length;
  const totalMinutes = history.length
    ? Math.round(history.reduce((sum, r) => sum + r.duration, 0) / 60)
    : 0;

  const latestTrend =
    history.length >= 2
      ? history[0].overallScore - history[1].overallScore
      : 0;

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-8">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <BarChart2 className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-3">No Progress Yet</h1>
          <p className="text-muted-foreground mb-6">
            Complete at least one speech practice session to see your progress analytics.
          </p>
          <Link to="/practice">
            <Button className="gradient-brand shadow-brand gap-2">
              <Mic className="h-4 w-4" />
              Start Practicing
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Your Progress</h1>
          <p className="text-muted-foreground">Track how your speaking skills improve over time.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Mic, label: "Total Speeches", value: totalSpeeches, color: "text-primary", bg: "bg-primary/10" },
            { icon: Target, label: "Avg Score", value: avgScore, color: "text-accent", bg: "bg-accent/10" },
            { icon: TrendingUp, label: "Best Score", value: bestScore, color: "text-success", bg: "bg-success/10" },
            { icon: Clock, label: "Minutes Practiced", value: totalMinutes, color: "text-secondary", bg: "bg-secondary/10" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card rounded-2xl p-4 shadow-card border border-border"
            >
              <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Trend indicator */}
        {history.length >= 2 && (
          <div className={`mb-6 flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
            latestTrend > 0 ? "bg-success/10 text-success" :
            latestTrend < 0 ? "bg-error/10 text-error" :
            "bg-muted text-muted-foreground"
          }`}>
            <TrendingUp className="h-4 w-4" />
            {latestTrend > 0 ? `Up ${latestTrend} points from last session — great progress!` :
             latestTrend < 0 ? `Down ${Math.abs(latestTrend)} points from last session — keep practicing!` :
             "No change from last session."}
          </div>
        )}

        {/* Score Over Time */}
        <Card className="p-5 shadow-card mb-6">
          <h3 className="text-sm font-semibold mb-4">Score Trends Over Time</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line type="monotone" dataKey="Overall" stroke="#4F46E5" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Clarity" stroke="#06B6D4" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Confidence" stroke="#6D28D9" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* WPM & Fillers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-5 shadow-card">
            <h3 className="text-sm font-semibold mb-4">Words Per Minute</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="WPM" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5 shadow-card">
            <h3 className="text-sm font-semibold mb-4">Filler Words Used</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="Fillers" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recent Sessions */}
        <Card className="shadow-card">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold">Recent Sessions</h3>
          </div>
          <div className="divide-y divide-border">
            {history.slice(0, 8).map((record, i) => (
              <div key={record.id} className="p-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{record.topic || "Free Practice"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(record.date).toLocaleDateString()} · {record.wordCount} words · {record.wpm} WPM
                  </p>
                </div>
                <div className={`text-lg font-display font-bold flex-shrink-0 ${
                  record.overallScore >= 80 ? "text-success" :
                  record.overallScore >= 60 ? "text-primary" : "text-warning"
                }`}>
                  {record.overallScore}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProgressPage;
