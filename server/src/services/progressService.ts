import { eq, and, asc } from 'drizzle-orm';
import { db } from '../db';
import { progressPoints } from '../db/schema';
import { AppError } from '../middleware/errorHandler';

export interface CreateProgressInput {
  date: string;
  readiness: number;
  interviews?: number;
  applications?: number;
}

export async function listProgress(userId: string) {
  return db
    .select()
    .from(progressPoints)
    .where(eq(progressPoints.userId, userId))
    .orderBy(asc(progressPoints.createdAt));
}

export async function createProgress(userId: string, input: CreateProgressInput) {
  const [point] = await db
    .insert(progressPoints)
    .values({ userId, ...input })
    .returning();
  return point;
}

export async function deleteProgress(userId: string, pointId: string) {
  const rows = await db
    .delete(progressPoints)
    .where(and(eq(progressPoints.id, pointId), eq(progressPoints.userId, userId)))
    .returning({ id: progressPoints.id });
  if (!rows[0]) throw new AppError(404, 'Progress point not found');
}
