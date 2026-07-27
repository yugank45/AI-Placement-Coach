import 'dotenv/config';
import { createApp } from './app';

const PORT = parseInt(process.env.PORT ?? '3001', 10);

const app = createApp();

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅  AI Placement Coach API running on http://0.0.0.0:${PORT}`);
  console.log(`📚  Swagger docs:     http://0.0.0.0:${PORT}/api-docs`);
  console.log(`🏥  Health check:     http://0.0.0.0:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received — closing server...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received — closing server...');
  server.close(() => process.exit(0));
});
