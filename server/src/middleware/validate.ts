import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Reads the result of express-validator chains and short-circuits with 422
 * when there are validation errors, returning all of them as an array.
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }
  next();
};
