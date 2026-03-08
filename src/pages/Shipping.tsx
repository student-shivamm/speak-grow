import { motion } from "framer-motion";
import { Package, Zap, Clock, Check } from "lucide-react";
import { Card } from "@/components/ui/card";

const ShippingPage = () => {
    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-accent/10 text-accent border border-accent/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4"
                    >
                        <Package className="h-3.5 w-3.5" />
                        Digital Delivery
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-display font-bold mb-3"
                    >
                        Shipping & Delivery Policy
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground"
                    >
                        Last updated: March 8, 2026
                    </motion.p>
                </div>

                <div className="space-y-6">
                    {/* No Physical Shipping */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <div className="bg-success/10 border border-success/20 rounded-2xl p-5 mb-2">
                            <p className="text-sm text-success font-medium flex items-start gap-2">
                                <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>
                                    SpeakGrow is a <strong>100% digital service</strong>. We do not ship any physical goods. There are no shipping charges. No physical address is required from customers.
                                </span>
                            </p>
                        </div>
                    </motion.div>

                    {/* What We Deliver */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <Card className="p-6 shadow-card">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Zap className="h-5 w-5 text-primary" />
                                </div>
                                <h2 className="text-lg font-display font-semibold">What We Deliver</h2>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                Upon successful payment through Razorpay, SpeakGrow delivers <strong>speech analysis credits</strong> — a digital entitlement — directly to your browser account. These credits allow you to:
                            </p>
                            <ul className="space-y-2.5">
                                {[
                                    "Record and submit speeches for AI-powered analysis",
                                    "Receive detailed feedback on clarity, confidence, pace, and structure",
                                    "View filler word detection, transcript, and improvement suggestions",
                                    "Track your speaking progress over time",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </motion.div>

                    {/* Delivery Timelines */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="p-6 shadow-card">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-accent" />
                                </div>
                                <h2 className="text-lg font-display font-semibold">Delivery Timeline</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/40">
                                    <div className="text-center flex-shrink-0">
                                        <p className="text-2xl font-display font-bold text-success">⚡</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm mb-1">Instant Delivery (Normal)</p>
                                        <p className="text-sm text-muted-foreground">Credits are added to your account automatically within seconds of a successful Razorpay payment.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/40">
                                    <div className="text-center flex-shrink-0">
                                        <p className="text-2xl font-display font-bold text-warning">🕐</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm mb-1">Up to 24 Hours (Technical Issues)</p>
                                        <p className="text-sm text-muted-foreground">In rare cases of webhook processing delays, credits may take up to 24 hours. Contact us if this happens.</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Access */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <Card className="p-6 shadow-card">
                            <h2 className="text-lg font-display font-semibold mb-3">How to Access Your Credits</h2>
                            <ol className="space-y-3">
                                {[
                                    "Complete payment via the Upgrade page using any UPI, card, or net banking method.",
                                    "After a successful payment, you will see your updated credit balance in the top-right corner of the website.",
                                    "Navigate to the Practice page and begin your speech session.",
                                    "Credits are stored locally in your browser. Do not clear browser data to retain your credits.",
                                ].map((step, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm">
                                        <div className="w-5 h-5 rounded-full gradient-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-primary-foreground text-xs font-bold">{i + 1}</span>
                                        </div>
                                        <span className="text-muted-foreground">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </Card>
                    </motion.div>

                    {/* Validity */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="p-6 shadow-card border-success/20">
                            <h2 className="text-lg font-display font-semibold mb-2 text-success">Credits Never Expire</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                SpeakGrow speech analysis credits have <strong>no expiry date</strong>. Once purchased, you can use them at any time at your own pace. There are no monthly limits or deadlines.
                            </p>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ShippingPage;
