import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Zap } from 'lucide-react';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [busy, setBusy]         = useState(false);

  const { login, register } = useAuth();
  const [, navigate] = useLocation();

  const toggle = () => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) { setError('Name is required.'); setBusy(false); return; }
        if (password.length < 8) { setError('Password must be at least 8 characters.'); setBusy(false); return; }
        await register(email, password, name.trim());
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 font-bold text-2xl text-primary tracking-tight mb-8">
        <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-mono">AI</div>
        Placement Coach
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>{mode === 'login' ? 'Welcome back' : 'Create your account'}</CardTitle>
          <CardDescription>
            {mode === 'login'
              ? 'Sign in to continue your placement prep.'
              : 'Set up your profile in seconds — no credit card needed.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Arjun Mehta"
                  required
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="arjun@iit.ac.in"
                required
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
                required
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
            )}

            {mode === 'register' && busy && (
              <p className="text-xs text-muted-foreground text-center">
                Setting up your account and seeding starter data…
              </p>
            )}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {mode === 'register' ? 'Creating account…' : 'Signing in…'}</>
              ) : (
                <><Zap className="w-4 h-4 mr-2" />{mode === 'login' ? 'Sign in' : 'Create account'}</>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={toggle} className="text-primary font-medium hover:underline">
              {mode === 'login' ? 'Register' : 'Sign in'}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
