module.exports = {
  apps: [
    {
      name: 'agentic-server',
      script: 'apps/server/index.js',
      cwd: process.cwd(),
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 8901
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8901
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      // Graceful shutdown
      shutdown_with_message: true,
      // Health monitoring
      min_uptime: '10s',
      max_restarts: 10,
      // Advanced PM2 features
      increment_var: 'PORT',
      combine_logs: true,
      // Environment-specific overrides
      node_args: '--max-old-space-size=1024'
    },
    {
      name: 'agentic-server-dev',
      script: 'apps/server/index.js',
      cwd: process.cwd(),
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: ['apps/server/**/*.js', 'packages/**/*.js'],
      ignore_watch: [
        'node_modules',
        'logs',
        '*.log',
        '.git',
        '.agentic',
        'reports'
      ],
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
        DEBUG: 'agentic:*'
      },
      error_file: './logs/pm2-dev-error.log',
      out_file: './logs/pm2-dev-out.log',
      log_file: './logs/pm2-dev-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      kill_timeout: 3000,
      wait_ready: true,
      listen_timeout: 8000,
      // Development-specific settings
      min_uptime: '5s',
      max_restarts: 5
    }
  ],

  deploy: {
    production: {
      user: 'node',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'git@github.com:repo.git',
      path: '/var/www/production',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};