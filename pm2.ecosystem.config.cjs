module.exports = {
  apps: [
    {
      name: 'loomora-api',
      cwd: './backend',
      script: 'dist/main.js',
      instances: 4, // Optimiert: 4 statt max
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      // Load .env file
      node_args: '-r dotenv/config',
    },
  ],
};
