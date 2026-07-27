import { eq } from 'drizzle-orm';
import { db } from '../db';
import { resumeAnalyses } from '../db/schema';
import { AppError } from '../middleware/errorHandler';

export interface ResumeInput {
  atsScore: number;
  extractedSkills: string[];
  gaps: { skill: string; reason: string }[];
  recommendedCourses: { title: string; url: string; duration: string }[];
  fileName?: string;
}

export async function getResume(userId: string) {
  const rows = await db
    .select()
    .from(resumeAnalyses)
    .where(eq(resumeAnalyses.userId, userId));
  if (!rows[0]) throw new AppError(404, 'Resume analysis not found');
  return rows[0];
}

export async function upsertResume(userId: string, input: ResumeInput) {
  const existing = await db
    .select({ id: resumeAnalyses.id })
    .from(resumeAnalyses)
    .where(eq(resumeAnalyses.userId, userId));

  if (existing[0]) {
    const [updated] = await db
      .update(resumeAnalyses)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(resumeAnalyses.userId, userId))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(resumeAnalyses)
    .values({ userId, ...input })
    .returning();
  return created;
}

export async function deleteResume(userId: string) {
  const rows = await db
    .delete(resumeAnalyses)
    .where(eq(resumeAnalyses.userId, userId))
    .returning({ id: resumeAnalyses.id });
  if (!rows[0]) throw new AppError(404, 'Resume analysis not found');
}
