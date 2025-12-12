'use strict';

const Hapi = require('@hapi/hapi');

const init = async () => {
  const server = Hapi.server({
    // 1. Ganti 5000 jadi process.env.PORT (PENTING! Biar Railway yang atur port-nya)
    port: process.env.PORT || 5000, 
    
    // 2. Ganti 'localhost' jadi '0.0.0.0' (WAJIB! Biar bisa diakses dari luar container)
    host: '0.0.0.0', 
    
    routes: {
      cors: {
        origin: ['*'], 
        additionalHeaders: ['cache-control', 'x-requested-with']
      },
    },
  });

  // Pastikan folder src/api/users dan src/api/leads ada dan memiliki index.js
  await server.register([
    require('./src/api/users'),
    require('./src/api/leads')
  ], {
    routes: {
      prefix: '/api' 
    }
  });

  await server.start();
  console.log('Server Hapi berjalan di %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});


init();

