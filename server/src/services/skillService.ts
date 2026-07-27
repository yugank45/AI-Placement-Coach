import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { skills } from '../db/schema';
import { AppError } from '../middleware/errorHandler';

export type SkillCategory = 'core' | 'framework' | 'soft' | 'tool';

export interface CreateSkillInput {
  name: string;
  currentLevel: number;
  requiredLevel: number;
  category: SkillCategory;
}

export async function listSkills(userId: string) {
  return db.select().from(skills).where(eq(skills.userId, userId));
}

export async function getSkill(userId: string, skillId: string) {
  const rows = await db
    .select()
    .from(skills)
    .where(and(eq(skills.id, skillId), eq(skills.userId, userId)));
  if (!rows[0]) throw new AppError(404, 'Skill not found');
  return rows[0];
}

export async function createSkill(userId: string, input: CreateSkillInput) {
  const [skill] = await db
    .insert(skills)
    .values({ userId, ...input })
    .returning();
  return skill;
}

export async function updateSkill(
  userId: string,
  skillId: string,
  input: Partial<CreateSkillInput>,
) {
  const rows = await db
    .update(skills)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(skills.id, skillId), eq(skills.userId, userId)))
    .returning();
  if (!rows[0]) throw new AppError(404, 'Skill not found');
  return rows[0];
}

export async function deleteSkill(userId: string, skillId: string) {
  const rows = await db
    .delete(skills)
    .where(and(eq(skills.id, skillId), eq(skills.userId, userId)))
    .returning({ id: skills.id });
  if (!rows[0]) throw new AppError(404, 'Skill not found');
}
