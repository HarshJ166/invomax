export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 8080,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  baseUrl: process.env.BASE_URL || 'http://localhost:8080',
};
