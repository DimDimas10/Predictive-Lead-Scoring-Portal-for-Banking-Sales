const Joi = require('joi');
const {
  loginHandler,
  getUsersHandler,
  createUserHandler,
  getUserByIdHandler,
  updateUserHandler,
  deleteUserHandler
} = require('./handler');

const routes = [
  // LOGIN
  {
    method: 'POST',
    path: '/login',
    handler: loginHandler,
    options: {
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string().required(),
        }),
        failAction: async (request, h, err) => {
          // Return JSON response bahkan saat validation error
          console.error('Validation Error:', err.message);
          return h.response({
            message: 'Validasi gagal',
            details: err.details.map(d => d.message)
          }).code(400).takeover();
        }
      },
    },
  },

  // GET semua user
  {
    method: 'GET',
    path: '/users',
    handler: getUsersHandler,
  },

  // GET user by id
  {
    method: 'GET',
    path: '/users/{id}',
    handler: getUserByIdHandler,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
        failAction: async (request, h, err) => {
          return h.response({
            message: 'ID tidak valid'
          }).code(400).takeover();
        }
      }
    }
  },

  // Tambah user baru
  {
    method: 'POST',
    path: '/users',
    handler: createUserHandler,
    options: {
      validate: {
        payload: Joi.object({
          name: Joi.string().min(3).required(),
          email: Joi.string().email().required(),
          role: Joi.string().valid('admin', 'sales').required(),
          password: Joi.string().min(6).required(),
        }),
        failAction: async (request, h, err) => {
          return h.response({
            message: 'Validasi gagal',
            details: err.details.map(d => d.message)
          }).code(400).takeover();
        }
      },
    },
  },

  // Update user
  {
    method: 'PUT',
    path: '/users/{id}',
    handler: updateUserHandler,
    options: {
      validate: {
        params: Joi.object({ id: Joi.string().required() }),
        payload: Joi.object({
          name: Joi.string().min(3).required(),
          email: Joi.string().email().required(),
          role: Joi.string().valid('admin', 'sales').required(),
          password: Joi.string().min(6).optional().allow('', null),
        }),
        failAction: async (request, h, err) => {
          return h.response({
            message: 'Validasi gagal',
            details: err.details.map(d => d.message)
          }).code(400).takeover();
        }
      },
    },
  },

  // Delete user
  {
    method: 'DELETE',
    path: '/users/{id}',
    handler: deleteUserHandler,
    options: {
      validate: {
        params: Joi.object({ id: Joi.string().required() }),
        failAction: async (request, h, err) => {
          return h.response({
            message: 'ID tidak valid'
          }).code(400).takeover();
        }
      }
    }
  },
];

module.exports = routes;
