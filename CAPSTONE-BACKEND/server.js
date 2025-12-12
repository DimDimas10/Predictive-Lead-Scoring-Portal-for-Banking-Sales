'use strict';

const Hapi = require('@hapi/hapi');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5000, 
    host: '0.0.0.0', 
    routes: {
      cors: {
        origin: ['*'], 
        additionalHeaders: ['cache-control', 'x-requested-with']
      },
    },
  });

  // Global error handler - pastikan selalu return JSON
  server.ext('onPreResponse', (request, h) => {
    const response = request.response;

    // Jika bukan error, lanjutkan
    if (!response.isBoom) {
      return h.continue;
    }

    // Log error untuk debugging
    console.error('Error occurred:', {
      statusCode: response.output.statusCode,
      message: response.message,
      stack: response.stack
    });

    // Return JSON error response
    return h.response({
      message: response.message || 'Terjadi kesalahan server',
      statusCode: response.output.statusCode,
      error: process.env.NODE_ENV === 'development' ? response.output.payload.error : undefined
    }).code(response.output.statusCode);
  });

  // Test database connection
  const pool = require('./src/db');
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }

  // Register routes
  try {
    await server.register([
      require('./src/api/users'),
      require('./src/api/leads')
    ], {
      routes: {
        prefix: '/api' 
      }
    });
    console.log('✅ Routes registered successfully');
  } catch (err) {
    console.error('❌ Failed to register routes:', err);
    process.exit(1);
  }

  await server.start();
  console.log('🚀 Server Hapi berjalan di %s', server.info.uri);
  console.log('📍 Environment:', process.env.NODE_ENV || 'development');
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

init();
