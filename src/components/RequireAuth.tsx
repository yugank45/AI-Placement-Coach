import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface Props { children: React.ReactNode; }

/**
 * Wraps any route that requires authentication.
 * — While the initial auth check is in progress: shows a full-screen spinner.
 * — If not authenticated: redirects to /login.
 * — Otherwise: renders children normally.
 */
export function RequireAuth({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}
