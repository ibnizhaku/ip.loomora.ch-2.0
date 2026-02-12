const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend directory
const envPath = path.resolve(__dirname, 'backend', '.env');
const envConfig = dotenv.config({ path: envPath });

if (envConfig.error) {
  console.warn(`Warning: Could not load .env from ${envPath}`);
}

module.exports = {
  apps: [{
    name: 'loomora-api',
    cwd: './backend',
    script: 'dist/src/main.js',
    instances: 4,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 3001,
      HOST: process.env.HOST || '0.0.0.0',
      DATABASE_URL: process.env.DATABASE_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION || '15m',
      JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '7d',
      CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://app.loomora.ch',
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
      SMTP_FROM: process.env.SMTP_FROM,
    },
  }],
};
