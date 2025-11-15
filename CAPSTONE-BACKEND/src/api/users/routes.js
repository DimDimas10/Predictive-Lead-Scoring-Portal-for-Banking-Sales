const Joi = require('joi');
const { loginHandler } = require('./handler');

const routes = [
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
];

module.exports = routes;