import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    credits: number;
}

interface AuthState {
    user: User | null;
    session: Session | null;
    profile: UserProfile | null;
    initialized: boolean;
    initialize: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    profile: null,
    initialized: false,
    refreshProfile: async () => {
        const { user } = get();
        if (!user) {
            set({ profile: null });
            return;
        }
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (!error && data) {
                set({ profile: data });
            }
        } catch (e) {
            console.error('Error fetching user profile:', e);
        }
    },
    initialize: async () => {
        try {
            // Get initial session
            const { data: { session } } = await supabase.auth.getSession();
            set({ session, user: session?.user || null, initialized: !!session });

            if (session?.user) {
                await get().refreshProfile();
            }
            set({ initialized: true });

            // Listen for auth changes
            supabase.auth.onAuthStateChange(async (_event, session) => {
                set({ session, user: session?.user || null });
                if (session?.user) {
                    await get().refreshProfile();
                } else {
                    set({ profile: null });
                }
            });
        } catch (err) {
            console.error('Failed to initialize Supabase Auth:', err);
            set({ initialized: true });
        }
    },
    signOut: async () => {
        await supabase.auth.signOut();
    }
}));
