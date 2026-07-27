/**
 * Typed API client for AI Placement Coach.
 * All requests go to /api — Vite proxies them to the Express server in dev.
 */

// ── Error class ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Token helpers ─────────────────────────────────────────────────────────────

const TOKEN_KEY = 'apc_token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

// ── Base fetch ────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers ?? {}) as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });

  // Global session expiry handling
  if (res.status === 401) {
    clearToken();
    window.location.replace('/login');
    throw new ApiError(401, 'Session expired — please log in again.');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new ApiError(res.status, body.error ?? `Request failed (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Domain types ──────────────────────────────────────────────────────────────

export interface User        { id: string; email: string; createdAt: string; }
export interface AuthResponse { token: string; user: User; }

export interface Profile {
  id: string; userId: string; name: string;
  university: string | null; targetRole: string | null;
  readinessScore: number; createdAt: string; updatedAt: string;
}

export interface Skill {
  id: string; userId: string; name: string;
  currentLevel: number; requiredLevel: number;
  category: 'core' | 'framework' | 'soft' | 'tool';
  createdAt: string; updatedAt: string;
}

export interface ResumeAnalysis {
  id: string; userId: string; atsScore: number;
  extractedSkills: string[];
  gaps: { skill: string; reason: string }[];
  recommendedCourses: { title: string; url: string; duration: string }[];
  fileName: string | null; createdAt: string; updatedAt: string;
}

export interface InterviewSession {
  id: string; userId: string; date: string; role: string;
  question: string; score: number | null; feedback: string | null;
  status: 'completed' | 'in_progress'; createdAt: string; updatedAt: string;
}

export type JobStatus = 'saved' | 'applied' | 'interviewing' | 'offer';
export interface JobPosting {
  id: string; userId: string; company: string; role: string;
  location: string | null; remote: boolean; fitScore: number;
  status: JobStatus; salary: string | null; logoUrl: string | null;
  createdAt: string; updatedAt: string;
}

export interface ProgressPoint {
  id: string; userId: string; date: string;
  readiness: number; interviews: number; applications: number;
  createdAt: string;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (email: string, password: string, name: string) =>
    apiFetch<AuthResponse>('/auth/register', {
      method: 'POST', body: JSON.stringify({ email, password, name }),
    }),
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }),
  me: () => apiFetch<User>('/auth/me'),
};

// ── Profile ───────────────────────────────────────────────────────────────────

export const profileApi = {
  get: () => apiFetch<Profile>('/profile'),
  update: (data: Partial<Pick<Profile, 'name' | 'university' | 'targetRole' | 'readinessScore'>>) =>
    apiFetch<Profile>('/profile', { method: 'PUT', body: JSON.stringify(data) }),
};

// ── Skills ────────────────────────────────────────────────────────────────────

export type CreateSkillInput = Pick<Skill, 'name' | 'currentLevel' | 'requiredLevel' | 'category'>;
export const skillsApi = {
  list: () => apiFetch<Skill[]>('/skills'),
  create: (data: CreateSkillInput) =>
    apiFetch<Skill>('/skills', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateSkillInput>) =>
    apiFetch<Skill>(`/skills/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch<void>(`/skills/${id}`, { method: 'DELETE' }),
};

// ── Resume ────────────────────────────────────────────────────────────────────

export type UpsertResumeInput = Pick<ResumeAnalysis, 'atsScore' | 'extractedSkills' | 'gaps' | 'recommendedCourses'> & { fileName?: string };
export const resumeApi = {
  get: () => apiFetch<ResumeAnalysis>('/resume'),
  upsert: (data: UpsertResumeInput) =>
    apiFetch<ResumeAnalysis>('/resume', { method: 'POST', body: JSON.stringify(data) }),
  delete: () => apiFetch<void>('/resume', { method: 'DELETE' }),
};

// ── Interviews ────────────────────────────────────────────────────────────────

export type CreateInterviewInput = Pick<InterviewSession, 'date' | 'role' | 'question'>
  & Partial<Pick<InterviewSession, 'score' | 'feedback' | 'status'>>;
export const interviewsApi = {
  list: () => apiFetch<InterviewSession[]>('/interviews'),
  create: (data: CreateInterviewInput) =>
    apiFetch<InterviewSession>('/interviews', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Pick<InterviewSession, 'score' | 'feedback' | 'status'>>) =>
    apiFetch<InterviewSession>(`/interviews/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch<void>(`/interviews/${id}`, { method: 'DELETE' }),
};

// ── Jobs ──────────────────────────────────────────────────────────────────────

export type CreateJobInput = Pick<JobPosting, 'company' | 'role'>
  & Partial<Pick<JobPosting, 'location' | 'remote' | 'fitScore' | 'status' | 'salary'>>;
export const jobsApi = {
  list: (status?: JobStatus) => apiFetch<JobPosting[]>(`/jobs${status ? `?status=${status}` : ''}`),
  create: (data: CreateJobInput) =>
    apiFetch<JobPosting>('/jobs', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateJobInput & { status: JobStatus }>) =>
    apiFetch<JobPosting>(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: JobStatus) =>
    apiFetch<JobPosting>(`/jobs/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (id: string) => apiFetch<void>(`/jobs/${id}`, { method: 'DELETE' }),
};

// ── Progress ──────────────────────────────────────────────────────────────────

export type CreateProgressInput = Pick<ProgressPoint, 'date' | 'readiness'>
  & Partial<Pick<ProgressPoint, 'interviews' | 'applications'>>;
export const progressApi = {
  list: () => apiFetch<ProgressPoint[]>('/progress'),
  create: (data: CreateProgressInput) =>
    apiFetch<ProgressPoint>('/progress', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch<void>(`/progress/${id}`, { method: 'DELETE' }),
};
