import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { session, initialized } = useAuthStore();
    const location = useLocation();

    if (!initialized) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
