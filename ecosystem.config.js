// PM2 Ecosystem Config cho DakLak.today
// Chạy: pm2 start ecosystem.config.js
// Xem log: pm2 logs daklak-today
// Reload: pm2 reload daklak-today
// Auto-start khi reboot: pm2 startup && pm2 save

module.exports = {
  apps: [
    {
      name        : 'daklak-today',
      script      : 'server.js',
      instances   : 1,           // tăng lên 'max' nếu muốn cluster
      exec_mode   : 'fork',
      watch       : false,
      max_memory_restart: '500M',

      env: {
        NODE_ENV : 'production',
        PORT     : 3028,
      },

      // Log
      out_file    : './logs/out.log',
      error_file  : './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',

      // Auto restart nếu crash
      autorestart : true,
      restart_delay: 3000,
    },
  ],
};
