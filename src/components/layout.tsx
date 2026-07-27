import { Link, useLocation } from 'wouter';
import { LayoutDashboard, FileText, MonitorPlay, Briefcase, TrendingUp, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const { profile, logout } = useAuth();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard',       icon: LayoutDashboard },
    { href: '/resume',    label: 'Resume Analyzer',  icon: FileText         },
    { href: '/interview', label: 'Mock Interview',   icon: MonitorPlay      },
    { href: '/jobs',      label: 'Job Matches',      icon: Briefcase        },
    { href: '/progress',  label: 'Progress',         icon: TrendingUp       },
  ];

  const displayName   = profile?.name      ?? '—';
  const displayRole   = profile?.targetRole ?? 'Student';
  const initials      = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col justify-between hidden md:flex shrink-0 z-10">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-border">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight">
              <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-mono">AI</div>
              Coach
            </Link>
          </div>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
              {profile ? initials : <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{displayRole}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden h-16 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center font-mono text-xs">AI</div>
            Coach
          </Link>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
