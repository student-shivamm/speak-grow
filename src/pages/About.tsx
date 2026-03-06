import { motion } from "framer-motion";
import { Mic, Target, TrendingUp, Heart, Mail, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logoImage from "@/assets/logo.png";

const values = [
  {
    icon: Target,
    title: "Precision Feedback",
    desc: "We analyze every aspect of your speech — clarity, pace, confidence, and structure — to give you actionable feedback.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Heart,
    title: "Accessible Practice",
    desc: "No expensive coaching required. Practice anytime, anywhere, directly in your browser with no account required.",
    color: "text-error",
    bg: "bg-error/10",
  },
  {
    icon: TrendingUp,
    title: "Measurable Growth",
    desc: "Track your progress over time with clear charts and metrics that show real improvement.",
    color: "text-success",
    bg: "bg-success/10",
  },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <img src={logoImage} alt="SpeakBetter" className="h-16 w-auto mx-auto mb-6" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-display font-bold mb-4"
          >
            About <span className="text-gradient-brand">SpeakBetter</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            SpeakBetter is an AI-powered public speaking practice platform that helps anyone — 
            from students to executives — become a more confident, clear, and compelling communicator.
          </motion.p>
        </div>

        {/* Mission */}
        <div className="bg-card rounded-3xl p-8 shadow-card border border-border mb-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          <div className="relative">
            <h2 className="text-xl font-display font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Public speaking is consistently ranked as one of the most feared skills — yet it's one of the most 
              valuable for career success, leadership, and personal growth. We believe everyone deserves access 
              to quality speaking practice, not just those who can afford private coaches.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              SpeakBetter uses browser-native technology and AI analysis to provide instant, actionable feedback 
              on your speeches — completely free to get started, with no account required.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-5 shadow-card border border-border card-hover"
            >
              <div className={`w-10 h-10 rounded-xl ${value.bg} flex items-center justify-center mb-4`}>
                <value.icon className={`h-5 w-5 ${value.color}`} />
              </div>
              <h3 className="font-display font-semibold mb-2">{value.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="bg-muted/40 rounded-2xl p-6 mb-10">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 text-accent" />
            Built with Modern Web Technology
          </h3>
          <div className="flex flex-wrap gap-2">
            {["React + Vite", "TypeScript", "TailwindCSS", "Shadcn UI", "Framer Motion", "Web Speech API", "Recharts", "Razorpay", "n8n Automation", "Zustand"].map((tech) => (
              <span key={tech} className="bg-card border border-border rounded-full px-3 py-1 text-xs font-medium text-muted-foreground">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div id="contact" className="text-center">
          <h3 className="text-xl font-display font-bold mb-3">Get in Touch</h3>
          <p className="text-muted-foreground mb-5">Have questions, feedback, or partnership inquiries?</p>
          <a href="mailto:hello@speakbetter.app">
            <Button variant="outline" className="gap-2">
              <Mail className="h-4 w-4" />
              hello@speakbetter.app
            </Button>
          </a>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center p-8 bg-gradient-to-br from-primary/10 via-card to-secondary/10 rounded-3xl border border-primary/20">
          <h3 className="text-2xl font-display font-bold mb-3">Ready to Speak Better?</h3>
          <p className="text-muted-foreground mb-6">Start with 1 free credit. No account needed.</p>
          <Link to="/practice">
            <Button className="gradient-brand shadow-brand gap-2 h-11 px-8">
              <Mic className="h-5 w-5" />
              Start Practicing Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
