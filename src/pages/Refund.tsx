import { motion } from "framer-motion";
import { RefreshCw, Clock, AlertTriangle, Check, X, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";

const RefundPage = () => {
    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-warning/10 text-warning border border-warning/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Refund Policy
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-display font-bold mb-3"
                    >
                        Refund & Cancellation Policy
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
                    {/* Nature of Service */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="p-6 shadow-card">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <AlertTriangle className="h-5 w-5 text-primary" />
                                </div>
                                <h2 className="text-lg font-display font-semibold">Nature of Our Service</h2>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                SpeakGrow sells <strong>digital speech analysis credits</strong> — a non-tangible, intangible product. Upon successful payment, speech credits are immediately credited to your account and become available for use.
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Because credits are a digital product that can be immediately consumed, our refund policy is structured as outlined below.
                            </p>
                        </Card>
                    </motion.div>

                    {/* Refund Eligibility */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <Card className="p-6 shadow-card">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
                                    <Check className="h-5 w-5 text-success" />
                                </div>
                                <h2 className="text-lg font-display font-semibold">When You Are Eligible for a Refund</h2>
                            </div>
                            <ul className="space-y-3">
                                {[
                                    "Payment was deducted from your account but credits were NOT added to your SpeakGrow account due to a technical error.",
                                    "You were charged twice for the same order (duplicate charge).",
                                    "Payment failed at the gateway level but your bank account was debited.",
                                    "Any other payment processing error that results in a charge without service delivery.",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                        <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </motion.div>

                    {/* Not Eligible */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="p-6 shadow-card">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-lg bg-error/10 flex items-center justify-center">
                                    <X className="h-5 w-5 text-error" />
                                </div>
                                <h2 className="text-lg font-display font-semibold">When Refunds Are NOT Applicable</h2>
                            </div>
                            <ul className="space-y-3">
                                {[
                                    "Credits have already been used (even partially) for speech analysis sessions.",
                                    "Change of mind after a successful purchase and credit delivery.",
                                    "Non-usage of credits — unused credits do not expire and can be used anytime.",
                                    "Technical issues on your own device or browser that are outside our control.",
                                    "Dissatisfaction with the AI analysis quality (we encourage you to test with your 1 free credit first).",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                        <X className="h-4 w-4 text-error mt-0.5 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </motion.div>

                    {/* Timeline */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <Card className="p-6 shadow-card">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-accent" />
                                </div>
                                <h2 className="text-lg font-display font-semibold">Refund Process & Timeline</h2>
                            </div>
                            <ol className="space-y-4">
                                {[
                                    { step: "1", title: "Submit a Request", desc: "Email buisnessshivam02@gmail.com with your Razorpay Payment ID, the amount, and a description of the issue within 7 days of the transaction." },
                                    { step: "2", title: "Review (24–48 hours)", desc: "Our team will review your request and verify the transaction details with Razorpay's dashboard." },
                                    { step: "3", title: "Resolution", desc: "If eligible, we will either add the missing credits to your account OR initiate a refund to your original payment source within 5–7 business days." },
                                    { step: "4", title: "Bank Processing", desc: "Refunds, once processed by us, may take an additional 5–10 business days to reflect in your account depending on your bank/card issuer." },
                                ].map((item) => (
                                    <li key={item.step} className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full gradient-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-primary-foreground text-xs font-bold">{item.step}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold mb-0.5">{item.title}</p>
                                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </Card>
                    </motion.div>

                    {/* Cancellation */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="p-6 shadow-card">
                            <h2 className="text-lg font-display font-semibold mb-3">Cancellation Policy</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                SpeakGrow does not offer subscription plans — all purchases are one-time credit packs. There is no recurring billing and hence no subscription to cancel.
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                If you have initiated a payment but it has not yet been completed (e.g., payment page is still open), you may close the payment window to cancel the transaction. No charge will be made if the payment was not completed.
                            </p>
                        </Card>
                    </motion.div>

                    {/* Contact */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-start gap-3"
                    >
                        <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-semibold mb-1">Contact for Refunds</p>
                            <p className="text-sm text-muted-foreground">
                                Email:{" "}
                                <a href="mailto:buisnessshivam02@gmail.com" className="text-primary hover:underline font-medium">
                                    buisnessshivam02@gmail.com
                                </a>
                                {" "}· Phone: <a href="tel:+918168443935" className="text-primary hover:underline font-medium">+91 8168443935</a>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default RefundPage;
