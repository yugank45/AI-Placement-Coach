import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as profileService from '../services/profileService';

const router = Router();

// All profile routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 *       404:
 *         description: Profile not found
 */
router.get('/', async (req: AuthRequest, res: any, next: any) => {
  try {
    const profile = await profileService.getProfile(req.userId!);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update the authenticated user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               university:
 *                 type: string
 *               targetRole:
 *                 type: string
 *               readinessScore:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *     responses:
 *       200:
 *         description: Updated profile
 *       422:
 *         description: Validation errors
 */
router.put(
  '/',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be blank'),
    body('university').optional().trim(),
    body('targetRole').optional().trim(),
    body('readinessScore')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('readinessScore must be 0–100'),
  ],
  validate,
  async (req: AuthRequest, res: any, next: any) => {
    try {
      const { name, university, targetRole, readinessScore } = req.body as {
        name?: string;
        university?: string;
        targetRole?: string;
        readinessScore?: number;
      };
      const profile = await profileService.updateProfile(req.userId!, {
        name,
        university,
        targetRole,
        readinessScore,
      });
      res.json(profile);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
