export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  database: { url: process.env.DATABASE_URL },
  redis: { url: process.env.REDIS_URL },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  fastapi: {
    url: process.env.FASTAPI_INTERNAL_URL || 'http://localhost:8000',
    apiKey: process.env.FASTAPI_INTERNAL_API_KEY,
  },
  storage: {
    endpoint: process.env.STORAGE_ENDPOINT,
    accessKey: process.env.STORAGE_ACCESS_KEY,
    secretKey: process.env.STORAGE_SECRET_KEY,
    bucket: process.env.STORAGE_BUCKET || 'daily-english-lab',
    region: process.env.STORAGE_REGION || 'us-east-1',
    publicUrl: process.env.STORAGE_PUBLIC_URL,
  },
  frontend: { url: process.env.FRONTEND_URL || 'http://localhost:3000' },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 60,
  },
});
