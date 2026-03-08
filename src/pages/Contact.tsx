import { motion } from "framer-motion";
import { Phone, MapPin, Mail, Clock, MessageSquare, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const ContactPage = () => {
    const contactDetails = [
        {
            icon: Building2,
            label: "Trade Name",
            value: "SpeakGrow",
            color: "text-primary",
            bg: "bg-primary/10",
        },
        {
            icon: Phone,
            label: "Phone",
            value: "+91 8168443935",
            href: "tel:+918168443935",
            color: "text-success",
            bg: "bg-success/10",
        },
        {
            icon: Mail,
            label: "Email",
            value: "buisnessshivam02@gmail.com",
            href: "mailto:buisnessshivam02@gmail.com",
            color: "text-accent",
            bg: "bg-accent/10",
        },
        {
            icon: MapPin,
            label: "Address",
            value: "Dwarka, New Delhi, Delhi - 110075, India",
            color: "text-warning",
            bg: "bg-warning/10",
        },
        {
            icon: Clock,
            label: "Support Hours",
            value: "Monday – Saturday: 10:00 AM – 6:00 PM IST",
            color: "text-secondary-foreground",
            bg: "bg-muted",
        },
    ];

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4"
                    >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Get In Touch
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-display font-bold mb-3"
                    >
                        Contact Us
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground max-w-xl mx-auto"
                    >
                        Have a question, need help with a payment, or want to give feedback? We're here to help.
                    </motion.p>
                </div>

                {/* Contact Cards */}
                <div className="space-y-4 mb-10">
                    {contactDetails.map((item, i) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                        >
                            <Card className="p-5 shadow-card flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                                    <item.icon className={`h-5 w-5 ${item.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium mb-1">{item.label}</p>
                                    {item.href ? (
                                        <a href={item.href} className={`font-semibold ${item.color} hover:underline transition-colors`}>
                                            {item.value}
                                        </a>
                                    ) : (
                                        <p className="font-semibold text-foreground">{item.value}</p>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Payment Support Note */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-primary/5 border border-primary/20 rounded-2xl p-6"
                >
                    <h2 className="font-display font-bold text-lg mb-2 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Payment or Credit Issues?
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        If you have been charged but credits haven't been added to your account, please email us at{" "}
                        <a href="mailto:buisnessshivam02@gmail.com" className="text-primary font-medium hover:underline">
                            buisnessshivam02@gmail.com
                        </a>{" "}
                        with your Razorpay Payment ID and we will resolve it within 24–48 hours.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Your Razorpay Payment ID can be found in the payment confirmation email sent by Razorpay.
                    </p>
                </motion.div>

                {/* Registered Office */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-6 text-center text-xs text-muted-foreground"
                >
                    <p className="font-semibold text-foreground mb-1">SpeakGrow</p>
                    <p>Dwarka, New Delhi, Delhi - 110075, India</p>
                    <p className="mt-1">GSTIN: N/A (Exempt — Startup)</p>
                </motion.div>
            </div>
        </div>
    );
};

export default ContactPage;
