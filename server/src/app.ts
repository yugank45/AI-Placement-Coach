import path from "path";
import fs from "fs";
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  // ─── Security ─────────────────────────────────────────────────────────────
  app.use(helmet());

  const allowedOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: allowedOrigins.length > 0 ? allowedOrigins : true,
      credentials: true,
    }),
  );

  // ─── Body parsing ─────────────────────────────────────────────────────────
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ─── Health check ─────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ─── Swagger docs ─────────────────────────────────────────────────────────
  const swaggerSpec = swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'AI Placement Coach API',
        version: '1.0.0',
        description:
          'RESTful API for AI Placement Coach — handles authentication, student profiles, skills, resume analysis, mock interviews, job tracking, and progress data.',
        contact: {
          name: 'AI Placement Coach',
        },
      },
      servers: [
        {
          url: process.env.API_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3001}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    apis: ['./src/routes/*.ts'],
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

  // ─── API routes ───────────────────────────────────────────────────────────
  app.use('/api', apiRoutes);

  // ─── Serve React Frontend ────────────────────────────────────────────────
const publicDir = path.join(process.cwd(), "public");

if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  app.get("*", (req, res, next) => {
    // Let API routes continue normally
    if (
      req.path.startsWith("/api") ||
      req.path.startsWith("/health") ||
      req.path.startsWith("/api-docs")
    ) {
      return next();
    }

    res.sendFile(path.join(publicDir, "index.html"));
  });
}

  // ─── 404 ──────────────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // ─── Global error handler ─────────────────────────────────────────────────
  app.use(errorHandler);

  return app;
}
