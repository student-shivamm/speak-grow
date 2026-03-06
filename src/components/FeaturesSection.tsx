import { motion } from "framer-motion";
import { Mic, BarChart2, Shuffle, MapPin, Zap, Eye } from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Live Speech Practice",
    description: "Use your browser's microphone to practice speeches in real-time with instant transcription.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Eye,
    title: "Real-Time Transcription",
    description: "See your words appear on screen as you speak using the Web Speech API.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: BarChart2,
    title: "AI Speech Analytics",
    description: "Receive clarity, confidence, and pace scores along with filler word detection.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Shuffle,
    title: "Random Topic Generator",
    description: "Never run out of things to say — choose from 60+ curated speaking prompts.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: MapPin,
    title: "Offline Communities",
    description: "Discover Toastmasters clubs and public speaking groups near your location.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: Zap,
    title: "Progress Tracking",
    description: "Track your improvement over time with historical charts and trend analysis.",
    color: "text-error",
    bg: "bg-error/10",
  },
];

const stepsData = [
  { step: "01", title: "Start a Speech", desc: "Click the microphone and speak on any topic." },
  { step: "02", title: "Speak Naturally", desc: "Your words are transcribed in real-time by the browser." },
  { step: "03", title: "Get Instant Feedback", desc: "Receive AI analysis on clarity, confidence, and pace." },
  { step: "04", title: "Improve Over Time", desc: "Track your progress and watch your scores climb." },
];

const FeaturesSection = () => {
  return (
    <>
      {/* Features Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-semibold text-primary uppercase tracking-widest"
            >
              Everything You Need
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-display font-bold mt-3 mb-4"
            >
              Powerful Features for Better Speaking
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground max-w-xl mx-auto"
            >
              Everything you need to practice, analyze, and improve your public speaking skills — all in one place.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-2xl p-6 shadow-card border border-border card-hover"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-base font-display font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-accent uppercase tracking-widest">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mt-3 mb-4">
              From Zero to Confident Speaker
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {stepsData.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative text-center"
              >
                {i < stepsData.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/40 to-transparent" />
                )}
                <div className="w-16 h-16 rounded-full gradient-brand shadow-brand flex items-center justify-center mx-auto mb-4 text-primary-foreground font-display font-bold text-lg">
                  {step.step}
                </div>
                <h3 className="font-display font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturesSection;
