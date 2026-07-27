import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { interviewSessions } from '../db/schema';
import { AppError } from '../middleware/errorHandler';

export type InterviewStatus = 'completed' | 'in_progress';

export interface CreateInterviewInput {
  date: string;
  role: string;
  question: string;
  score?: number;
  feedback?: string;
  status?: InterviewStatus;
}

export interface UpdateInterviewInput {
  date?: string;
  role?: string;
  question?: string;
  score?: number | null;
  feedback?: string | null;
  status?: InterviewStatus;
}

export async function listInterviews(userId: string) {
  return db
    .select()
    .from(interviewSessions)
    .where(eq(interviewSessions.userId, userId))
    .orderBy(desc(interviewSessions.createdAt));
}

export async function getInterview(userId: string, sessionId: string) {
  const rows = await db
    .select()
    .from(interviewSessions)
    .where(and(eq(interviewSessions.id, sessionId), eq(interviewSessions.userId, userId)));
  if (!rows[0]) throw new AppError(404, 'Interview session not found');
  return rows[0];
}

export async function createInterview(userId: string, input: CreateInterviewInput) {
  const [session] = await db
    .insert(interviewSessions)
    .values({ userId, ...input })
    .returning();
  return session;
}

export async function updateInterview(
  userId: string,
  sessionId: string,
  input: UpdateInterviewInput,
) {
  const rows = await db
    .update(interviewSessions)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(interviewSessions.id, sessionId), eq(interviewSessions.userId, userId)))
    .returning();
  if (!rows[0]) throw new AppError(404, 'Interview session not found');
  return rows[0];
}

export async function deleteInterview(userId: string, sessionId: string) {
  const rows = await db
    .delete(interviewSessions)
    .where(and(eq(interviewSessions.id, sessionId), eq(interviewSessions.userId, userId)))
    .returning({ id: interviewSessions.id });
  if (!rows[0]) throw new AppError(404, 'Interview session not found');
}
