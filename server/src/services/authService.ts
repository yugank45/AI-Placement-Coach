import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, profiles } from '../db/schema';
import { AppError } from '../middleware/errorHandler';

const SALT_ROUNDS = 12;

function getSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === 'production') {
      throw new AppError(500, 'JWT_SECRET is not configured');
    }
    // Dev-only fallback — never used in production
    return 'apc-dev-secret-local-only-change-in-prod';
  }
  return s;
}

export async function registerUser(email: string, password: string, name: string) {
  // Check for duplicate email
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    throw new AppError(409, 'Email already in use');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [user] = await db
    .insert(users)
    .values({ email, passwordHash })
    .returning({ id: users.id, email: users.email, createdAt: users.createdAt });

  await db.insert(profiles).values({ userId: user.id, name });

  const signOpts: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'] };
  const token = jwt.sign({ userId: user.id }, getSecret(), signOpts);

  return { token, user };
}

export async function loginUser(email: string, password: string) {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  const user = rows[0];
  if (!user) throw new AppError(401, 'Invalid email or password');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError(401, 'Invalid email or password');

  const signOpts: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'] };
  const token = jwt.sign({ userId: user.id }, getSecret(), signOpts);

  return {
    token,
    user: { id: user.id, email: user.email, createdAt: user.createdAt },
  };
}

export async function getMe(userId: string) {
  const rows = await db
    .select({ id: users.id, email: users.email, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, userId));

  if (!rows[0]) throw new AppError(404, 'User not found');
  return rows[0];
}
