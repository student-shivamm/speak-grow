import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";

const Auth = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { session } = useAuthStore();
    const from = location.state?.from?.pathname || "/";

    useEffect(() => {
        if (session) {
            navigate(from, { replace: true });
        }
    }, [session, navigate, from]);

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] p-4 bg-muted/30">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-card p-8 rounded-2xl shadow-xl border border-border"
            >
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">
                        Welcome Back
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Sign in to your account or create a new one to continue your journey.
                    </p>
                </div>
                <SupabaseAuth
                    supabaseClient={supabase}
                    appearance={{
                        theme: ThemeSupa,
                        variables: {
                            default: {
                                colors: {
                                    brand: 'hsl(var(--primary))',
                                    brandAccent: 'hsl(var(--primary))',
                                    inputBackground: 'hsl(var(--background))',
                                    inputBorder: 'hsl(var(--border))',
                                    inputText: 'hsl(var(--foreground))',
                                    inputLabelText: 'hsl(var(--foreground))',
                                },
                            },
                        },
                        className: {
                            input: 'bg-background border-input text-foreground font-medium rounded-md',
                            button: 'rounded-md',
                            label: 'text-muted-foreground font-medium',
                        }
                    }}
                    providers={['google']}
                    redirectTo={`${window.location.origin}${from}`}
                />
            </motion.div>
        </div>
    );
};

export default Auth;
