import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/routes/api';
import { initializeBot } from './server/services/telegramBot';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Production security and compression middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Turn off CSP for preview frame compatibility
    crossOriginEmbedderPolicy: false
  }));
  app.use(cors());
  app.use(compression());
  app.use(express.json());

  // 2. Register API sub-routes
  app.use('/api', apiRouter);

  // 3. Initialize background Telegram Bot service
  initializeBot();

  // 4. Vite middleware configuration or production static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 5. Port binding (bind specifically to 0.0.0.0 as required by the environment)
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SARA UYLAR Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal: Server crash during startup:', err);
});
