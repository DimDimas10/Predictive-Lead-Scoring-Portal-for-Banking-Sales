const Joi = require('joi');
const {
  loginHandler,
  getUsersHandler,
  createUserHandler,
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
      },
    },
  },

  // GET semua user
  {
    method: 'GET',
    path: '/users',   
    handler: getUsersHandler,
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
      },
    },
  },
];

module.exports = routes;
