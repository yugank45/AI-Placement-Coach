import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate, AuthRequest } from '../middleware/auth';
import * as authService from '../services/authService';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created; returns JWT token and basic user data
 *       409:
 *         description: Email already in use
 *       422:
 *         description: Validation errors
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
  ],
  validate,
  async (req: AuthRequest, res: any, next: any) => {
    try {
      const { email, password, name } = req.body as {
        email: string;
        password: string;
        name: string;
      };
      const result = await authService.registerUser(email, password, name);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns JWT token and basic user data
 *       401:
 *         description: Invalid credentials
 *       422:
 *         description: Validation errors
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  async (req: AuthRequest, res: any, next: any) => {
    try {
      const { email, password } = req.body as { email: string; password: string };
      const result = await authService.loginUser(email, password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the currently authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Not authenticated
 */
router.get('/me', authenticate, async (req: AuthRequest, res: any, next: any) => {
  try {
    const user = await authService.getMe(req.userId!);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
