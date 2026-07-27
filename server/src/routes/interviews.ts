import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as interviewService from '../services/interviewService';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /api/interviews:
 *   get:
 *     summary: List all interview sessions for the authenticated user
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of interview sessions (newest first)
 */
router.get('/', async (req: AuthRequest, res: any, next: any) => {
  try {
    const sessions = await interviewService.listInterviews(req.userId!);
    res.json(sessions);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/interviews/{id}:
 *   get:
 *     summary: Get a single interview session
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Interview session
 *       404:
 *         description: Not found
 */
router.get('/:id', async (req: AuthRequest, res: any, next: any) => {
  try {
    const session = await interviewService.getInterview(req.userId!, req.params.id);
    res.json(session);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/interviews:
 *   post:
 *     summary: Create a new interview session
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, role, question]
 *             properties:
 *               date:
 *                 type: string
 *               role:
 *                 type: string
 *               question:
 *                 type: string
 *               score:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               feedback:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [completed, in_progress]
 *     responses:
 *       201:
 *         description: Created session
 *       422:
 *         description: Validation errors
 */
router.post(
  '/',
  [
    body('date').notEmpty().withMessage('date is required'),
    body('role').trim().notEmpty().withMessage('role is required'),
    body('question').trim().notEmpty().withMessage('question is required'),
    body('score').optional({ nullable: true }).isInt({ min: 0, max: 100 }),
    body('feedback').optional({ nullable: true }).trim(),
    body('status').optional().isIn(['completed', 'in_progress']),
  ],
  validate,
  async (req: AuthRequest, res: any, next: any) => {
    try {
      const session = await interviewService.createInterview(req.userId!, req.body);
      res.status(201).json(session);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /api/interviews/{id}:
 *   put:
 *     summary: Update an interview session
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated session
 *       404:
 *         description: Not found
 */
router.put(
  '/:id',
  [
    body('date').optional().notEmpty(),
    body('role').optional().trim().notEmpty(),
    body('question').optional().trim().notEmpty(),
    body('score').optional({ nullable: true }).isInt({ min: 0, max: 100 }),
    body('feedback').optional({ nullable: true }).trim(),
    body('status').optional().isIn(['completed', 'in_progress']),
  ],
  validate,
  async (req: AuthRequest, res: any, next: any) => {
    try {
      const session = await interviewService.updateInterview(
        req.userId!,
        req.params.id,
        req.body,
      );
      res.json(session);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /api/interviews/{id}:
 *   delete:
 *     summary: Delete an interview session
 *     tags: [Interviews]
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
    await interviewService.deleteInterview(req.userId!, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
