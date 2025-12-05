const Joi = require('joi');
const {
  getLeadsHandler,
  getLeadByIdHandler,
  updateLeadStatusHandler,
  updateLeadNotesHandler,
  refreshLeadsWithMLHandler,
} = require('./handler');

const routes = [
  {
    method: 'GET',
    path: '/leads',
    handler: getLeadsHandler,
  },
  {
    method: 'GET',
    path: '/leads/{id}',
    handler: getLeadByIdHandler,
  },
  {
    method: 'POST',
    path: '/leads/refresh-ml',
    handler: refreshLeadsWithMLHandler, 
  },
{
  method: 'PUT',
  path: '/leads/{id}/status',
  handler: updateLeadStatusHandler,
  options: {
    validate: {
      payload: Joi.object({
        status: Joi.string().valid('pending', 'contacted', 'converted', 'rejected').required(),
        userId: Joi.string().required(),   
      }),
    },
  },
},

  {
    method: 'PUT',
    path: '/leads/{id}/notes',
    handler: updateLeadNotesHandler,
    options: {
      validate: {
        payload: Joi.object({
          notes: Joi.string().allow('').required(),
        }),
      },
    },
  },
];

module.exports = routes;