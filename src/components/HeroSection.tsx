import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mic, MapPin, ArrowRight, Play, Star, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "10K+", label: "Speeches Analyzed" },
  { value: "94%", label: "Improvement Rate" },
  { value: "50+", label: "Speaking Topics" },
  { value: "2", label: "Free Credits" },
];

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 pt-16 pb-24">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-accent/3 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6"
          >
            <Star className="h-3.5 w-3.5 fill-primary" />
            AI-Powered Public Speaking Coach
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold leading-tight mb-6"
          >
            Practice Public Speaking with{" "}
            <span className="text-gradient-brand">Instant AI Feedback</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto"
          >
            Improve clarity, confidence, and communication skills by practicing speeches online.
            Get instant AI analysis — sign up to get your first 2 credits free.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          >
            <Link to="/practice">
              <Button size="lg" className="gradient-brand shadow-brand text-primary-foreground gap-2 h-12 px-8 text-base font-semibold group">
                <Mic className="h-5 w-5" />
                Start Practicing
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/find-clubs">
              <Button variant="outline" size="lg" className="gap-2 h-12 px-8 text-base font-semibold">
                <MapPin className="h-5 w-5 text-accent" />
                Find Speaking Clubs
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {stats.map((stat, i) => (
              <div key={i} className="bg-card rounded-2xl p-4 shadow-card border border-border">
                <div className="text-2xl font-display font-bold text-gradient-brand">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Hero Visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <div className="relative bg-card rounded-3xl shadow-brand border border-border p-8 overflow-hidden">
            {/* Mock practice UI preview */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <div className="relative flex flex-col items-center gap-6">
              {/* Mock microphone button */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-accent/20 scale-150 animate-ping" />
                <div className="relative w-20 h-20 rounded-full gradient-brand shadow-glow flex items-center justify-center">
                  <Mic className="h-9 w-9 text-primary-foreground" />
                </div>
              </div>
              {/* Mock transcript */}
              <div className="w-full max-w-lg bg-muted rounded-xl p-4 text-sm text-muted-foreground text-center leading-relaxed">
                "Today I want to talk about the importance of clear communication in everyday life.
                First, let me start with why most people struggle to express their ideas..."
              </div>
              {/* Mock scores */}
              <div className="flex gap-4">
                {[
                  { label: "Clarity", value: 84, color: "text-success" },
                  { label: "Confidence", value: 78, color: "text-primary" },
                  { label: "Pace", value: 92, color: "text-accent" },
                ].map((score) => (
                  <div key={score.label} className="bg-card rounded-xl p-3 text-center border border-border min-w-[80px]">
                    <div className={`text-xl font-display font-bold ${score.color}`}>{score.value}</div>
                    <div className="text-xs text-muted-foreground">{score.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
