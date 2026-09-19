import 'dotenv/config';
import express from 'express';

// Routes
import authRoutes from './routes/auth.routes';
import boardRoutes from './routes/board.routes';
import aiRoutes from './routes/ai.routes';
import chatRoutes from './routes/chat.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// ────────────────────────────────────────────────────────────────────
// Middleware
// ────────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/boards', boardRoutes);  // POST|GET /api/boards, GET /api/boards/:id
app.use('/api/ai', aiRoutes);         // GET /api/ai/recommend, POST /api/ai/analyze
app.use('/api/chat', chatRoutes);     // POST /api/chat/rooms, GET /api/chat/rooms/:roomId

// ────────────────────────────────────────────────────────────────────
// 404 Handler
// ────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Not Found' });
});

// ────────────────────────────────────────────────────────────────────
// Start Server
// ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('📍 Registered Routes:');
  console.log('   POST  /api/auth/login');
  console.log('   POST  /api/auth/register');
  console.log('   POST  /api/boards');
  console.log('   GET   /api/boards');
  console.log('   GET   /api/boards/:id');
  console.log('   GET   /api/ai/recommend');
  console.log('   POST  /api/ai/analyze');
  console.log('   POST  /api/chat/rooms');
  console.log('   GET   /api/chat/rooms/:roomId');
});

export default app;
