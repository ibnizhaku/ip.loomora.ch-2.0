module.exports = {
  apps: [
    {
      name: 'loomora-api',
      script: './dist/main.js',
      cwd: '/var/www/loomora/backend',
      instances: 4,
      exec_mode: 'cluster',
      node_args: '',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      // Automatischer Neustart bei Crashes
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      // Logs
      out_file: '/root/.pm2/logs/loomora-api-out.log',
      error_file: '/root/.pm2/logs/loomora-api-error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
