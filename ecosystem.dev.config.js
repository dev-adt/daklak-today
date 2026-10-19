// PM2 Ecosystem Config cho DEV Test (dev.daklak.today)
// Chạy: pm2 start ecosystem.dev.config.js
// Xem log: pm2 logs dev-daklak-today
// Reload: pm2 reload dev-daklak-today

module.exports = {
  apps: [
    {
      name        : 'dev-daklak-today',
      script      : 'server.js',
      instances   : 1,
      exec_mode   : 'fork',
      watch       : false,
      max_memory_restart: '500M',

      env: {
        NODE_ENV : 'production',
        PORT     : 3030,
        SITE_URL : 'https://dev.daklak.today',
        ALLOWED_ORIGIN : 'https://dev.daklak.today,http://localhost:3030'
      },

      // Log
      out_file    : './logs/dev_out.log',
      error_file  : './logs/dev_error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',

      // Auto restart nếu crash
      autorestart : true,
      restart_delay: 3000,
    },
  ],
};
