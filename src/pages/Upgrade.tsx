import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Check, CreditCard, Shield, Star, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCreditStore } from "@/store/creditStore";

const packages = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 5,
    price: 99,
    priceDisplay: "₹99",
    description: "Perfect for occasional practice",
    features: ["5 speech credits", "Full AI analysis", "Progress tracking", "No expiry"],
    popular: false,
    color: "border-border",
  },
  {
    id: "pro",
    name: "Pro Pack",
    credits: 20,
    price: 299,
    priceDisplay: "₹299",
    description: "Best value for regular speakers",
    features: ["20 speech credits", "Full AI analysis", "Progress tracking", "No expiry", "Save 40% vs Starter"],
    popular: true,
    color: "border-primary",
  },
  {
    id: "ultimate",
    name: "Ultimate Pack",
    credits: 50,
    price: 599,
    priceDisplay: "₹599",
    description: "For dedicated practice routines",
    features: ["50 speech credits", "Full AI analysis", "Progress tracking", "No expiry", "Save 50% vs Starter", "Priority support"],
    popular: false,
    color: "border-border",
  },
];

declare global {
  interface Window {
    Razorpay: any;
  }
}

const UpgradePage = () => {
  const { credits, addCredits } = useCreditStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRazorpay = () => {
    return new Promise<boolean>((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async (pkg: typeof packages[0]) => {
    setLoading(pkg.id);
    setError(null);
    setSuccess(null);
    const loaded = await loadRazorpay();
    if (!loaded) {
      setError("Payment gateway failed to load. Please check your internet connection.");
      setLoading(null);
      return;
    }

    // NOTE: Replace with your actual Razorpay Key ID
    const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder";

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: pkg.price * 100, // paise
      currency: "INR",
      name: "SpeakGrow",
      description: `${pkg.name} — ${pkg.credits} Speech Credits`,
      image: "/favicon.ico",
      handler: function (response: any) {
        // In production: validate via n8n webhook
        // For demo: directly add credits
        addCredits(pkg.credits);
        setSuccess(`${pkg.credits} credits added successfully! Payment ID: ${response.razorpay_payment_id}`);
        setLoading(null);
      },
      prefill: {
        name: "",
        email: "",
        contact: "",
      },
      notes: {
        package_id: pkg.id,
        credits: pkg.credits,
      },
      theme: {
        color: "#4F46E5",
      },
      modal: {
        ondismiss: () => setLoading(null),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response: any) {
      setError(`Payment failed: ${response.error.description || "Please try again or use a different payment method."}`);
      setLoading(null);
    });
    rzp.open();
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-warning/10 text-warning border border-warning/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4"
          >
            <Zap className="h-3.5 w-3.5" />
            Upgrade Your Credits
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-display font-bold mb-3"
          >
            Keep Improving Your Speaking
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-xl mx-auto"
          >
            You currently have <span className="font-bold text-accent">{credits} credit{credits !== 1 ? "s" : ""}</span> remaining.
            Each speech practice consumes 1 credit.
          </motion.p>
        </div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 rounded-xl bg-success/10 border border-success/20 flex items-start gap-3"
          >
            <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
            <p className="text-sm text-success font-medium">{success}</p>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 rounded-xl bg-error/10 border border-error/20 flex items-start gap-3"
          >
            <Shield className="h-5 w-5 text-error mt-0.5 flex-shrink-0" />
            <p className="text-sm text-error font-medium">{error}</p>
          </motion.div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-card rounded-3xl p-6 shadow-card border-2 ${pkg.color} ${pkg.popular ? "shadow-brand" : ""} card-hover`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gradient-brand text-primary-foreground border-0 shadow-brand gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-lg font-display font-bold mb-1">{pkg.name}</h3>
                <p className="text-xs text-muted-foreground">{pkg.description}</p>
              </div>

              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold">{pkg.priceDisplay}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Zap className="h-3.5 w-3.5 text-accent" />
                  <span className="text-sm font-semibold text-accent">{pkg.credits} speech credits</span>
                </div>
              </div>

              <ul className="space-y-2.5 mb-6">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full gap-2 ${pkg.popular ? "gradient-brand shadow-brand text-primary-foreground" : ""}`}
                variant={pkg.popular ? "default" : "outline"}
                onClick={() => handlePurchase(pkg)}
                disabled={loading === pkg.id}
              >
                {loading === pkg.id ? (
                  "Opening Payment..."
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Buy {pkg.name}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Security badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-success" />
            Secured by Razorpay
          </div>
          <div className="flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-primary" />
            All major cards & UPI accepted
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-success" />
            Credits never expire
          </div>
        </div>

      </div>
    </div>
  );
};

export default UpgradePage;
