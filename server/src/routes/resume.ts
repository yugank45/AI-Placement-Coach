import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as resumeService from '../services/resumeService';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /api/resume:
 *   get:
 *     summary: Get the authenticated user's latest resume analysis
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resume analysis
 *       404:
 *         description: No resume analysis found
 */
router.get('/', async (req: AuthRequest, res: any, next: any) => {
  try {
    const analysis = await resumeService.getResume(req.userId!);
    res.json(analysis);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/resume:
 *   post:
 *     summary: Create or replace a resume analysis (upsert)
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [atsScore, extractedSkills, gaps, recommendedCourses]
 *             properties:
 *               atsScore:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               extractedSkills:
 *                 type: array
 *                 items:
 *                   type: string
 *               gaps:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     skill:
 *                       type: string
 *                     reason:
 *                       type: string
 *               recommendedCourses:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     url:
 *                       type: string
 *                     duration:
 *                       type: string
 *               fileName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Upserted resume analysis
 *       422:
 *         description: Validation errors
 */
router.post(
  '/',
  [
    body('atsScore').isInt({ min: 0, max: 100 }).withMessage('atsScore must be 0–100'),
    body('extractedSkills').isArray().withMessage('extractedSkills must be an array'),
    body('extractedSkills.*').isString(),
    body('gaps').isArray().withMessage('gaps must be an array'),
    body('gaps.*.skill').notEmpty().withMessage('Each gap must have a skill'),
    body('gaps.*.reason').notEmpty().withMessage('Each gap must have a reason'),
    body('recommendedCourses').isArray().withMessage('recommendedCourses must be an array'),
    body('recommendedCourses.*.title').notEmpty(),
    body('recommendedCourses.*.url').notEmpty(),
    body('recommendedCourses.*.duration').notEmpty(),
    body('fileName').optional().trim(),
  ],
  validate,
  async (req: AuthRequest, res: any, next: any) => {
    try {
      const result = await resumeService.upsertResume(req.userId!, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /api/resume:
 *   delete:
 *     summary: Delete the authenticated user's resume analysis
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.delete('/', async (req: AuthRequest, res: any, next: any) => {
  try {
    await resumeService.deleteResume(req.userId!);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
