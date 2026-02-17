// ============================================================================
// TASKIFY - Main Server
// Task Management API sa Kanban Board funkcionalnostima
// ============================================================================

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';

// Rute
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import boardRoutes from './routes/board.routes.js';
import columnRoutes from './routes/column.routes.js';
import taskRoutes from './routes/task.routes.js';
import labelRoutes from './routes/label.routes.js';
import notificationRoutes from './routes/notification.routes.js';

const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS middleware
app.use(cors({
  origin: true,  // Dozvoli sve origin-e za development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// ============================================================================
// SWAGGER API DOCS
// ============================================================================

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/health', (_req, res) => res.json({ ok: true, app: 'Taskify' }));

// Auth
app.use('/api/auth', authRoutes);

// Projects
app.use('/api/projects', projectRoutes);

// Boards i Columns (nested routes)
app.use('/api', boardRoutes);
app.use('/api', columnRoutes);

// Tasks
app.use('/api/tasks', taskRoutes);

// Labels
app.use('/api/labels', labelRoutes);

// Notifications
app.use('/api/notifications', notificationRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Taskify API running on http://localhost:${PORT}`);
});
