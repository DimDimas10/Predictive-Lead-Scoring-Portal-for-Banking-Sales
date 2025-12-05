'use strict';

const Hapi = require('@hapi/hapi');

const init = async () => {
  const server = Hapi.server({
    port: 5000,
    host: 'localhost',
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