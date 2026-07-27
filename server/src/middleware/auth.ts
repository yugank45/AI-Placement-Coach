import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
}

/**
 * Extracts and verifies a Bearer JWT from the Authorization header.
 * Attaches `req.userId` on success; returns 401 on failure.
 */
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization header missing or malformed' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const secret =
    process.env.JWT_SECRET ??
    (process.env.NODE_ENV !== 'production'
      ? 'apc-dev-secret-local-only-change-in-prod'
      : null);

  if (!secret) {
    res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET not set' });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.userId = payload.userId;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token has expired' });
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  }
};
