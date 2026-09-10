import 'dotenv/config';
import app from './src/app.js';
import db from './src/config/db.js';

const PORT = Number(process.env.PORT || 5000);

const server = app.listen(PORT, () => {
  console.log(`Furnishing Essentials backend running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

const shutdown = async (signal) => {
  console.log(`\n${signal} received — shutting down gracefully...`);
  server.close(async () => {
    try {
      await db.end();
      console.log('Database pool closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error closing database pool:', err.message);
      process.exit(1);
    }
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
