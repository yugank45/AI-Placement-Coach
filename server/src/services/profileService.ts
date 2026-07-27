import { eq } from 'drizzle-orm';
import { db } from '../db';
import { profiles } from '../db/schema';
import { AppError } from '../middleware/errorHandler';

export async function getProfile(userId: string) {
  const rows = await db.select().from(profiles).where(eq(profiles.userId, userId));
  if (!rows[0]) throw new AppError(404, 'Profile not found');
  return rows[0];
}

export async function updateProfile(
  userId: string,
  data: {
    name?: string;
    university?: string;
    targetRole?: string;
    readinessScore?: number;
  },
) {
  const rows = await db
    .update(profiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(profiles.userId, userId))
    .returning();

  if (!rows[0]) throw new AppError(404, 'Profile not found');
  return rows[0];
}
