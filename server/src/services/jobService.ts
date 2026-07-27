import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { jobPostings } from '../db/schema';
import { AppError } from '../middleware/errorHandler';

export type JobStatus = 'saved' | 'applied' | 'interviewing' | 'offer';

export interface CreateJobInput {
  company: string;
  role: string;
  location?: string;
  remote?: boolean;
  fitScore?: number;
  status?: JobStatus;
  salary?: string;
  logoUrl?: string;
}

export interface UpdateJobInput extends Partial<CreateJobInput> {}

export async function listJobs(userId: string, status?: JobStatus) {
  const base = db
    .select()
    .from(jobPostings)
    .where(eq(jobPostings.userId, userId));

  if (status) {
    return db
      .select()
      .from(jobPostings)
      .where(and(eq(jobPostings.userId, userId), eq(jobPostings.status, status)))
      .orderBy(desc(jobPostings.fitScore));
  }

  return db
    .select()
    .from(jobPostings)
    .where(eq(jobPostings.userId, userId))
    .orderBy(desc(jobPostings.fitScore));
}

export async function getJob(userId: string, jobId: string) {
  const rows = await db
    .select()
    .from(jobPostings)
    .where(and(eq(jobPostings.id, jobId), eq(jobPostings.userId, userId)));
  if (!rows[0]) throw new AppError(404, 'Job not found');
  return rows[0];
}

export async function createJob(userId: string, input: CreateJobInput) {
  const [job] = await db
    .insert(jobPostings)
    .values({ userId, ...input })
    .returning();
  return job;
}

export async function updateJob(userId: string, jobId: string, input: UpdateJobInput) {
  const rows = await db
    .update(jobPostings)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(jobPostings.id, jobId), eq(jobPostings.userId, userId)))
    .returning();
  if (!rows[0]) throw new AppError(404, 'Job not found');
  return rows[0];
}

export async function updateJobStatus(userId: string, jobId: string, status: JobStatus) {
  const rows = await db
    .update(jobPostings)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(jobPostings.id, jobId), eq(jobPostings.userId, userId)))
    .returning();
  if (!rows[0]) throw new AppError(404, 'Job not found');
  return rows[0];
}

export async function deleteJob(userId: string, jobId: string) {
  const rows = await db
    .delete(jobPostings)
    .where(and(eq(jobPostings.id, jobId), eq(jobPostings.userId, userId)))
    .returning({ id: jobPostings.id });
  if (!rows[0]) throw new AppError(404, 'Job not found');
}
