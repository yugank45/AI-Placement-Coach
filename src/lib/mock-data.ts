export type StudentProfile = {
  name: string;
  university: string;
  targetRole: string;
  readinessScore: number;
};

export type Skill = {
  id: string;
  name: string;
  currentLevel: number; // 0 to 10
  requiredLevel: number; // 0 to 10
  category: 'core' | 'framework' | 'soft' | 'tool';
};

export type ResumeAnalysis = {
  lastUpdated: string;
  extractedSkills: string[];
  gaps: { skill: string; reason: string }[];
  recommendedCourses: { title: string; url: string; duration: string }[];
  atsScore: number;
};

export type InterviewSession = {
  id: string;
  date: string;
  role: string;
  question: string;
  score: number | null;
  feedback: string | null;
  status: 'completed' | 'in_progress';
};

export type JobStatus = 'saved' | 'applied' | 'interviewing' | 'offer';

export type JobPosting = {
  id: string;
  company: string;
  role: string;
  location: string;
  remote: boolean;
  fitScore: number; // 0 to 100
  status: JobStatus;
  salary?: string;
  logoUrl?: string; // We'll use initials if empty
};

export type ProgressPoint = {
  date: string;
  readiness: number;
  interviews: number;
  applications: number;
};

// --- MOCK DATA ---

export const mockProfile: StudentProfile = {
  name: "Arjun Mehta",
  university: "Indian Institute of Technology",
  targetRole: "Frontend Engineer",
  readinessScore: 78,
};

export const mockSkills: Skill[] = [
  { id: '1', name: 'JavaScript', currentLevel: 8, requiredLevel: 9, category: 'core' },
  { id: '2', name: 'React', currentLevel: 7, requiredLevel: 8, category: 'framework' },
  { id: '3', name: 'TypeScript', currentLevel: 5, requiredLevel: 7, category: 'core' },
  { id: '4', name: 'System Design', currentLevel: 3, requiredLevel: 6, category: 'core' },
  { id: '5', name: 'CSS/Tailwind', currentLevel: 8, requiredLevel: 7, category: 'framework' },
  { id: '6', name: 'Communication', currentLevel: 7, requiredLevel: 8, category: 'soft' },
];

export const mockResumeAnalysis: ResumeAnalysis = {
  lastUpdated: "2023-10-15T10:00:00Z",
  atsScore: 72,
  extractedSkills: ["JavaScript", "React", "HTML", "CSS", "Git", "C++"],
  gaps: [
    { skill: "TypeScript", reason: "Most modern frontend roles require strict typing." },
    { skill: "State Management", reason: "Missing Redux or Zustand experience for complex apps." },
    { skill: "Testing", reason: "No mention of Jest or Cypress, critical for robust frontend engineering." }
  ],
  recommendedCourses: [
    { title: "Advanced React & TypeScript", url: "#", duration: "4 hours" },
    { title: "Frontend Testing Masterclass", url: "#", duration: "6 hours" }
  ]
};

export const mockInterviews: InterviewSession[] = [
  {
    id: "int_1",
    date: "2023-10-10",
    role: "Frontend Engineer",
    question: "Explain the virtual DOM and how React's reconciliation works.",
    score: 85,
    feedback: "Great explanation of diffing algorithm. Could have touched more on fiber architecture.",
    status: 'completed'
  },
  {
    id: "int_2",
    date: "2023-10-12",
    role: "Fullstack Intern",
    question: "How would you optimize a slow React application?",
    score: 65,
    feedback: "Mentioned useMemo but missed code splitting, lazy loading, and asset optimization.",
    status: 'completed'
  }
];

export const mockJobs: JobPosting[] = [
  { id: "job_1", company: "Razorpay", role: "Frontend Engineer - SDE 1", location: "Bengaluru", remote: false, fitScore: 92, status: 'interviewing', salary: "18-24 LPA" },
  { id: "job_2", company: "Vercel", role: "Software Engineer, Frontend", location: "Remote", remote: true, fitScore: 85, status: 'applied' },
  { id: "job_3", company: "Zomato", role: "UI Engineer", location: "Gurgaon", remote: false, fitScore: 78, status: 'saved', salary: "15-20 LPA" },
  { id: "job_4", company: "Atlassian", role: "Frontend Graduate 2024", location: "Bengaluru", remote: false, fitScore: 88, status: 'applied', salary: "25-30 LPA" },
  { id: "job_5", company: "Postman", role: "Software Developer Intern", location: "Remote", remote: true, fitScore: 95, status: 'offer', salary: "80k INR/mo" },
  { id: "job_6", company: "Cred", role: "Frontend Engineer I", location: "Bengaluru", remote: false, fitScore: 65, status: 'saved' },
];

export const mockProgress: ProgressPoint[] = [
  { date: "Aug", readiness: 45, interviews: 1, applications: 2 },
  { date: "Sep", readiness: 58, interviews: 3, applications: 5 },
  { date: "Oct", readiness: 78, interviews: 6, applications: 12 },
  { date: "Nov (Proj)", readiness: 85, interviews: 8, applications: 15 },
];
