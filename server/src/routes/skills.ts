import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as skillService from '../services/skillService';

const router = Router();
router.use(authenticate);

const VALID_CATEGORIES = ['core', 'framework', 'soft', 'tool'];

const levelField = (name: string) =>
  body(name)
    .isInt({ min: 0, max: 10 })
    .withMessage(`${name} must be an integer between 0 and 10`);

/**
 * @swagger
 * /api/skills:
 *   get:
 *     summary: List all skills for the authenticated user
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of skills
 */
router.get('/', async (req: AuthRequest, res: any, next: any) => {
  try {
    const result = await skillService.listSkills(req.userId!);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/skills/{id}:
 *   get:
 *     summary: Get a single skill by ID
 *     tags: [Skills]
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
 *         description: Skill data
 *       404:
 *         description: Not found
 */
router.get('/:id', async (req: AuthRequest, res: any, next: any) => {
  try {
    const skill = await skillService.getSkill(req.userId!, req.params.id);
    res.json(skill);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/skills:
 *   post:
 *     summary: Create a new skill
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, currentLevel, requiredLevel, category]
 *             properties:
 *               name:
 *                 type: string
 *               currentLevel:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 10
 *               requiredLevel:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 10
 *               category:
 *                 type: string
 *                 enum: [core, framework, soft, tool]
 *     responses:
 *       201:
 *         description: Created skill
 *       422:
 *         description: Validation errors
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    levelField('currentLevel'),
    levelField('requiredLevel'),
    body('category')
      .isIn(VALID_CATEGORIES)
      .withMessage(`category must be one of: ${VALID_CATEGORIES.join(', ')}`),
  ],
  validate,
  async (req: AuthRequest, res: any, next: any) => {
    try {
      const { name, currentLevel, requiredLevel, category } = req.body as skillService.CreateSkillInput;
      const skill = await skillService.createSkill(req.userId!, { name, currentLevel, requiredLevel, category });
      res.status(201).json(skill);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /api/skills/{id}:
 *   put:
 *     summary: Update a skill
 *     tags: [Skills]
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
 *         description: Updated skill
 *       404:
 *         description: Not found
 */
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be blank'),
    body('currentLevel').optional().isInt({ min: 0, max: 10 }),
    body('requiredLevel').optional().isInt({ min: 0, max: 10 }),
    body('category').optional().isIn(VALID_CATEGORIES),
  ],
  validate,
  async (req: AuthRequest, res: any, next: any) => {
    try {
      const skill = await skillService.updateSkill(req.userId!, req.params.id, req.body);
      res.json(skill);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /api/skills/{id}:
 *   delete:
 *     summary: Delete a skill
 *     tags: [Skills]
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
    await skillService.deleteSkill(req.userId!, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
