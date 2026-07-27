import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  authApi, profileApi, skillsApi, resumeApi, jobsApi, progressApi,
  User, Profile, getToken, setToken, clearToken,
} from '@/lib/api';

// ── Seeder ────────────────────────────────────────────────────────────────────
// Called once after a new user registers to populate their account with
// starter data so the app doesn't feel empty on first login.

async function seedInitialData() {
  await profileApi.update({
    targetRole: 'Frontend Engineer',
    university: 'Indian Institute of Technology',
    readinessScore: 78,
  });

  await Promise.all([
    skillsApi.create({ name: 'JavaScript',    currentLevel: 8, requiredLevel: 9, category: 'core'      }),
    skillsApi.create({ name: 'React',          currentLevel: 7, requiredLevel: 8, category: 'framework' }),
    skillsApi.create({ name: 'TypeScript',     currentLevel: 5, requiredLevel: 7, category: 'core'      }),
    skillsApi.create({ name: 'System Design',  currentLevel: 3, requiredLevel: 6, category: 'core'      }),
    skillsApi.create({ name: 'CSS/Tailwind',   currentLevel: 8, requiredLevel: 7, category: 'framework' }),
    skillsApi.create({ name: 'Communication',  currentLevel: 7, requiredLevel: 8, category: 'soft'      }),
  ]);

  await resumeApi.upsert({
    atsScore: 72,
    extractedSkills: ['JavaScript', 'React', 'HTML', 'CSS', 'Git', 'C++'],
    gaps: [
      { skill: 'TypeScript',       reason: 'Most modern frontend roles require strict typing.' },
      { skill: 'State Management', reason: 'Missing Redux or Zustand experience for complex apps.' },
      { skill: 'Testing',          reason: 'No mention of Jest or Cypress, critical for robust frontend engineering.' },
    ],
    recommendedCourses: [
      { title: 'Advanced React & TypeScript',  url: 'https://www.typescriptlang.org/docs/', duration: '4 hours' },
      { title: 'Frontend Testing Masterclass', url: 'https://jestjs.io/docs/getting-started',  duration: '6 hours' },
    ],
    fileName: 'sample_resume.pdf',
  });

  await Promise.all([
    jobsApi.create({ company: 'Razorpay',  role: 'Frontend Engineer - SDE 1', location: 'Bengaluru', remote: false, fitScore: 92, status: 'interviewing', salary: '18-24 LPA' }),
    jobsApi.create({ company: 'Vercel',    role: 'Software Engineer, Frontend', location: 'Remote',    remote: true,  fitScore: 85, status: 'applied' }),
    jobsApi.create({ company: 'Zomato',    role: 'UI Engineer',                location: 'Gurgaon',   remote: false, fitScore: 78, status: 'saved',  salary: '15-20 LPA' }),
    jobsApi.create({ company: 'Atlassian', role: 'Frontend Graduate 2024',     location: 'Bengaluru', remote: false, fitScore: 88, status: 'applied', salary: '25-30 LPA' }),
    jobsApi.create({ company: 'Postman',   role: 'Software Developer Intern',  location: 'Remote',    remote: true,  fitScore: 95, status: 'offer',   salary: '80k INR/mo' }),
    jobsApi.create({ company: 'Cred',      role: 'Frontend Engineer I',        location: 'Bengaluru', remote: false, fitScore: 65, status: 'saved' }),
  ]);

  // Sequential to preserve order (chart renders oldest-first)
  await progressApi.create({ date: 'Aug', readiness: 45, interviews: 1,  applications: 2 });
  await progressApi.create({ date: 'Sep', readiness: 58, interviews: 3,  applications: 5 });
  await progressApi.create({ date: 'Oct', readiness: 78, interviews: 6,  applications: 12 });
}

// ── Context types ─────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null, profile: null, isLoading: true, isAuthenticated: false,
  });

  // Restore session on mount
  useEffect(() => {
    const token = getToken();
    if (!token) { setState(s => ({ ...s, isLoading: false })); return; }

    Promise.all([authApi.me(), profileApi.get()])
      .then(([user, profile]) =>
        setState({ user, profile, isLoading: false, isAuthenticated: true }),
      )
      .catch(() => {
        clearToken();
        setState({ user: null, profile: null, isLoading: false, isAuthenticated: false });
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await authApi.login(email, password);
    setToken(token);
    const profile = await profileApi.get();
    setState({ user, profile, isLoading: false, isAuthenticated: true });
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const { token, user } = await authApi.register(email, password, name);
    setToken(token);
    await seedInitialData();
    const profile = await profileApi.get();
    setState({ user, profile, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setState({ user: null, profile: null, isLoading: false, isAuthenticated: false });
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await profileApi.get();
    setState(s => ({ ...s, profile }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
