import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter, Redirect } from 'wouter';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { RequireAuth } from '@/components/RequireAuth';

import LandingPage    from '@/pages/landing';
import AuthPage       from '@/pages/auth';
import Dashboard      from '@/pages/dashboard';
import ResumeAnalyzer from '@/pages/resume';
import MockInterview  from '@/pages/interview';
import JobsPage       from '@/pages/jobs';
import ProgressPage   from '@/pages/progress';
import NotFound       from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

/** Redirects authenticated users away from /login back to /dashboard */
function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Redirect to="/dashboard" />;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={LandingPage} />
      <Route path="/login">
        <GuestOnly><AuthPage /></GuestOnly>
      </Route>

      {/* Protected app routes */}
      <Route path="/dashboard">
        <RequireAuth><Dashboard /></RequireAuth>
      </Route>
      <Route path="/resume">
        <RequireAuth><ResumeAnalyzer /></RequireAuth>
      </Route>
      <Route path="/interview">
        <RequireAuth><MockInterview /></RequireAuth>
      </Route>
      <Route path="/jobs">
        <RequireAuth><JobsPage /></RequireAuth>
      </Route>
      <Route path="/progress">
        <RequireAuth><ProgressPage /></RequireAuth>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
