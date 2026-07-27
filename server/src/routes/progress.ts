import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as progressService from '../services/progressService';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /api/progress:
 *   get:
 *     summary: List all progress points for the authenticated user
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of progress points (oldest first)
 */
router.get('/', async (req: AuthRequest, res: any, next: any) => {
  try {
    const points = await progressService.listProgress(req.userId!);
    res.json(points);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/progress:
 *   post:
 *     summary: Record a new progress point
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, readiness]
 *             properties:
 *               date:
 *                 type: string
 *               readiness:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               interviews:
 *                 type: integer
 *                 minimum: 0
 *               applications:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Created progress point
 *       422:
 *         description: Validation errors
 */
router.post(
  '/',
  [
    body('date').notEmpty().withMessage('date is required'),
    body('readiness').isInt({ min: 0, max: 100 }).withMessage('readiness must be 0–100'),
    body('interviews').optional().isInt({ min: 0 }),
    body('applications').optional().isInt({ min: 0 }),
  ],
  validate,
  async (req: AuthRequest, res: any, next: any) => {
    try {
      const point = await progressService.createProgress(req.userId!, req.body);
      res.status(201).json(point);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /api/progress/{id}:
 *   delete:
 *     summary: Delete a progress point
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', async (req: AuthRequest, res: any, next: any) => {
  try {
    await progressService.deleteProgress(req.userId!, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
