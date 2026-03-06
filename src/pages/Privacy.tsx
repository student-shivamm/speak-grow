import { motion } from "framer-motion";
import { Shield, Lock, Eye, Trash2 } from "lucide-react";

const sections = [
  {
    icon: Eye,
    title: "What We Collect",
    content: [
      "Speech transcripts are processed entirely in your browser using the Web Speech API. We do not store or transmit your speech audio to any server.",
      "Speech analysis results (scores, metrics) are stored locally in your browser's localStorage only.",
      "Credit balance is stored in localStorage and is local to your device.",
      "If you make a payment via Razorpay, Razorpay collects your payment details per their privacy policy. We receive only a payment confirmation.",
    ],
  },
  {
    icon: Lock,
    title: "What We Don't Collect",
    content: [
      "We do not collect your name, email, or any personal identification without your consent.",
      "We do not record or store your voice or audio.",
      "We do not track your location beyond what you explicitly share for club discovery.",
      "We do not sell your data to third parties.",
      "We do not use cookies for tracking.",
    ],
  },
  {
    icon: Shield,
    title: "Data Security",
    content: [
      "All communication uses HTTPS encryption.",
      "Speech data never leaves your device — all analysis is performed client-side in JavaScript.",
      "Payment processing is handled entirely by Razorpay, a PCI DSS compliant payment gateway.",
      "Razorpay webhook signatures are validated to prevent fraudulent credit additions.",
    ],
  },
  {
    icon: Trash2,
    title: "Your Rights",
    content: [
      "You can clear all locally stored data at any time by clearing your browser's localStorage.",
      "Since we don't require accounts, there's no personal data stored on our servers to delete.",
      "You can use SpeakBetter anonymously without any registration.",
      "Location data is never stored — it's only used in the moment to generate a Google Maps search URL.",
    ],
  },
];

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-success/10 text-success border border-success/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4"
          >
            <Shield className="h-3.5 w-3.5" />
            Privacy First
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-display font-bold mb-3"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground"
          >
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </motion.p>
        </div>

        <div className="bg-success/10 border border-success/20 rounded-2xl p-5 mb-8">
          <p className="text-sm text-success font-medium">
            🔒 SpeakBetter is designed with privacy by default. Your speech data never leaves your device — all AI analysis happens locally in your browser.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl p-6 shadow-card border border-border"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center">
                  <section.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h2 className="text-lg font-display font-semibold">{section.title}</h2>
              </div>
              <ul className="space-y-3">
                {section.content.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Questions about our privacy practices?</p>
          <a href="mailto:privacy@speakbetter.app" className="text-primary hover:underline">
            privacy@speakbetter.app
          </a>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
