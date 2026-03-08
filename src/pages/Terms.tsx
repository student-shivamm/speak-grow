import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

const TermsPage = () => {
    const sections = [
        {
            title: "1. Acceptance of Terms",
            content: `By accessing and using SpeakGrow ("we", "our", "the Service") at speak-grow-xi.vercel.app, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the terms of this agreement, please do not use the Service.`,
        },
        {
            title: "2. Description of Service",
            content: `SpeakGrow provides an AI-powered public speaking practice platform. The Service allows users to record speeches, receive automated AI-generated feedback on clarity, confidence, pace, filler words, and overall structure. The Service is provided by SpeakGrow, operated by Shivam Bajaj, based in Dwarka, New Delhi, Delhi, India.`,
        },
        {
            title: "3. Credits and Payments",
            content: `SpeakGrow operates on a credit-based model. Each AI speech analysis session consumes one (1) credit. New users receive one (1) free credit upon first visiting the platform. Additional credits may be purchased via the Upgrade page using Razorpay. All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes. Credits are non-transferable, non-refundable (subject to our Refund Policy), and have no cash value.`,
        },
        {
            title: "4. Payment Terms",
            content: `All payments are processed through Razorpay Payment Solutions Private Limited, a third-party payment gateway. By making a payment, you agree to Razorpay's Terms of Service and Privacy Policy. We do not store any payment card data on our servers. Payment confirmation is provided by Razorpay via email. Credits are added to your account automatically upon successful payment confirmation.`,
        },
        {
            title: "5. User Conduct",
            content: `You agree not to use the Service to record or submit content that is unlawful, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable. You agree not to attempt to reverse-engineer, modify, copy, distribute, transmit, display, perform, or create derivative works of the Service. You are responsible for maintaining the confidentiality of your browser-stored data.`,
        },
        {
            title: "6. Intellectual Property",
            content: `The Service, including all content, features, and functionality (including but not limited to information, software, text, displays, images, and the design), is owned by SpeakGrow and is protected by Indian and international intellectual property laws. Your speech transcripts and recordings processed through the Service remain your property. By using the Service, you grant us a limited, non-exclusive license to process your speech data solely for the purpose of generating analysis feedback.`,
        },
        {
            title: "7. Privacy and Data",
            content: `Your speech audio is processed entirely in your browser using the Web Speech API and is never stored on our servers. AI analysis requests are sent to our n8n webhook for processing. Speech analysis results, credits, and history are stored locally in your browser's localStorage. Please refer to our Privacy Policy for full details on how we handle your information.`,
        },
        {
            title: "8. Disclaimer of Warranties",
            content: `The Service is provided on an "as is" and "as available" basis without any warranties of any kind. We do not guarantee that the Service will be uninterrupted, secure, or error-free. AI-generated speech feedback is provided for educational and practice purposes only and should not be considered professional coaching advice. The accuracy of speech analysis may vary based on microphone quality, background noise, and browser capabilities.`,
        },
        {
            title: "9. Limitation of Liability",
            content: `To the maximum extent permitted by applicable law, SpeakGrow shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Service. Our total liability for any claim arising out of or relating to the Service shall not exceed the amount you paid us for credits in the three months preceding the claim.`,
        },
        {
            title: "10. Changes to Terms",
            content: `We reserve the right to modify these Terms at any time. We will update the "Last updated" date at the top of this page when changes are made. Continued use of the Service after changes constitutes acceptance of the modified Terms. We encourage you to review these Terms periodically.`,
        },
        {
            title: "11. Governing Law & Dispute Resolution",
            content: `These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of New Delhi, Delhi, India. Before pursuing legal remedies, we encourage you to contact us at buisnessshivam02@gmail.com to resolve disputes amicably.`,
        },
        {
            title: "12. Contact Information",
            content: `For questions about these Terms of Service, please contact us:\n\nSpeakGrow\nDwarka, New Delhi, Delhi - 110075, India\nEmail: buisnessshivam02@gmail.com\nPhone: +91 8168443935`,
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
                        className="inline-flex items-center gap-2 bg-muted text-muted-foreground border border-border rounded-full px-4 py-1.5 text-sm font-medium mb-4"
                    >
                        <FileText className="h-3.5 w-3.5" />
                        Legal
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-display font-bold mb-3"
                    >
                        Terms & Conditions
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

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-8"
                >
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Please read these Terms and Conditions carefully before using <strong className="text-foreground">speak-grow-xi.vercel.app</strong>. By using our service, you confirm that you have read, understood, and agree to be bound by these terms.
                    </p>
                </motion.div>

                <div className="space-y-5">
                    {sections.map((section, i) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.04 }}
                        >
                            <Card className="p-6 shadow-card">
                                <h2 className="font-display font-semibold text-base mb-3 text-foreground">{section.title}</h2>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
