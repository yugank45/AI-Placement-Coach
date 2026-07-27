import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as jobService from '../services/jobService';

const router = Router();
router.use(authenticate);

const VALID_STATUSES = ['saved', 'applied', 'interviewing', 'offer'];

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: List all job postings for the authenticated user
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [saved, applied, interviewing, offer]
 *         description: Filter by application status
 *     responses:
 *       200:
 *         description: Array of job postings (highest fit score first)
 */
router.get(
  '/',
  [query('status').optional().isIn(VALID_STATUSES)],
  validate,
  async (req: AuthRequest, res: any, next: any) => {
    try {
      const status = req.query.status as jobService.JobStatus | undefined;
      const jobs = await jobService.listJobs(req.userId!, status);
      res.json(jobs);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get a single job posting
 *     tags: [Jobs]
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
 *         description: Job posting
 *       404:
 *         description: Not found
 */
router.get('/:id', async (req: AuthRequest, res: any, next: any) => {
  try {
    const job = await jobService.getJob(req.userId!, req.params.id);
    res.json(job);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Add a job posting to the tracker
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [company, role]
 *             properties:
 *               company:
 *                 type: string
 *               role:
 *                 type: string
 *               location:
 *                 type: string
 *               remote:
 *                 type: boolean
 *               fitScore:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               status:
 *                 type: string
 *                 enum: [saved, applied, interviewing, offer]
 *               salary:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created job posting
 *       422:
 *         description: Validation errors
 */
router.post(
  '/',
  [
    body('company').trim().notEmpty().withMessage('company is required'),
    body('role').trim().notEmpty().withMessage('role is required'),
    body('location').optional().trim(),
    body('remote').optional().isBoolean(),
    body('fitScore').optional().isInt({ min: 0, max: 100 }),
    body('status').optional().isIn(VALID_STATUSES),
    body('salary').optional().trim(),
    body('logoUrl').optional().isURL().withMessage('logoUrl must be a valid URL'),
  ],
  validate,
  async (req: AuthRequest, res: any, next: any) => {
    try {
      const job = await jobService.createJob(req.userId!, req.body);
      res.status(201).json(job);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     summary: Update a job posting
 *     tags: [Jobs]
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
 *         description: Updated job posting
 *       404:
 *         description: Not found
 */
router.put(
  '/:id',
  [
    body('company').optional().trim().notEmpty(),
    body('role').optional().trim().notEmpty(),
    body('location').optional().trim(),
    body('remote').optional().isBoolean(),
    body('fitScore').optional().isInt({ min: 0, max: 100 }),
    body('status').optional().isIn(VALID_STATUSES),
    body('salary').optional().trim(),
    body('logoUrl').optional().isURL(),
  ],
  validate,
  async (req: AuthRequest, res: any, next: any) => {
    try {
      const job = await jobService.updateJob(req.userId!, req.params.id, req.body);
      res.json(job);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /api/jobs/{id}/status:
 *   patch:
 *     summary: Update only the application status of a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [saved, applied, interviewing, offer]
 *     responses:
 *       200:
 *         description: Updated job
 *       404:
 *         description: Not found
 *       422:
 *         description: Validation errors
 */
router.patch(
  '/:id/status',
  [body('status').isIn(VALID_STATUSES).withMessage(`status must be one of: ${VALID_STATUSES.join(', ')}`)],
  validate,
  async (req: AuthRequest, res: any, next: any) => {
    try {
      const { status } = req.body as { status: jobService.JobStatus };
      const job = await jobService.updateJobStatus(req.userId!, req.params.id, status);
      res.json(job);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Delete a job posting
 *     tags: [Jobs]
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
    await jobService.deleteJob(req.userId!, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
