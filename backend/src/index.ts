import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Routes
import authRoutes from './routes/auth.routes';
import boardRoutes from './routes/board.routes';
import aiRoutes from './routes/ai.routes';
import chatRoutes from './routes/chat.routes';
import userRoutes from './routes/user.routes';
import metaRoutes from './routes/meta.routes';
import notificationRoutes from './routes/notification.routes';
import { createChatSocket } from './socket/chat.socket';
import { hydrateMemoryStore } from './services/persistence.service';

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? ['http://localhost:5173'];

// ────────────────────────────────────────────────────────────────────
// Middleware
// ────────────────────────────────────────────────────────────────────
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ────────────────────────────────────────────────────────────────────
// Swagger UI Docs
// ────────────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ────────────────────────────────────────────────────────────────────
// Health Check
// ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ────────────────────────────────────────────────────────────────────
// API Routes
// ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);     // POST /api/auth/login, /api/auth/register
app.use('/api/users', userRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// ────────────────────────────────────────────────────────────────────
// 404 Handler
// ────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Not Found' });
});

// ────────────────────────────────────────────────────────────────────
// Start Server
// ────────────────────────────────────────────────────────────────────
const server = http.createServer(app); createChatSocket(server);

const startServer = async (): Promise<void> => {
  try { await hydrateMemoryStore(); }
  catch (error) { console.error(error); process.exitCode = 1; return; }
  server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📑 Swagger Docs available at http://localhost:${PORT}/api-docs`);
  console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('📍 REST API: /api-docs');
  console.log('💬 Socket.IO path: /chat');
  });
};

void startServer();

export default app;
