// ============================================================================
// TASKIFY - Environment Configuration
// ============================================================================
import dotenv from 'dotenv';
dotenv.config();

export const env = {
  // Server
  PORT: process.env.PORT || 8081,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // JWT Authentication
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_NAME: process.env.COOKIE_NAME || 'taskify_token',

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:4200',

  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:4200',

  // SMTP (Email)
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: process.env.SMTP_PORT || '587',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || '',
};

// Validacija kriticnih promenljivih
if (!env.JWT_SECRET) {
  console.warn('[WARN] JWT_SECRET is not set. Set it in .env for security.');
}
