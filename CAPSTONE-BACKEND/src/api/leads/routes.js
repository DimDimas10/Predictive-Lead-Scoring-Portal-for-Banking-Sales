const Joi = require('joi');

const {
  getLeadsHandler,
  getLeadByIdHandler,
  getLeadsByUserHandler,
  addLeadHandler,
  updateLeadInfoHandler,
  deleteLeadHandler,
  updateLeadStatusHandler,
  updateLeadNotesHandler,
  refreshLeadsWithMLHandler,
  getSalesHistoryByUserHandler,
} = require('./handler');

const leadPayloadSchema = Joi.object({
  // Data Profil
  name: Joi.string().required(),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().required(),
  age: Joi.number().integer().min(17).required(),
  job: Joi.string().required(),
  marital: Joi.string().valid('married', 'single', 'divorced').required(),
  education: Joi.string().valid('primary', 'secondary', 'tertiary', 'unknown').required(),
  
  // Data Finansial
  balance: Joi.number().required(),
  housing: Joi.string().valid('yes', 'no').required(),
  loan: Joi.string().valid('yes', 'no').required(),
  
  // Data Campaign & Teknis (Opsional/Default)
  campaign: Joi.number().integer().min(1).default(1),
  poutcome: Joi.string().allow('', null).default('nonexistent'), 
  contact: Joi.string().allow('', null).default('cellular'),
  notes: Joi.string().allow('', null)
});

const routes = [
  // GET All Leads
  {
    method: 'GET',
    path: '/leads',
    handler: getLeadsHandler,
  },

  // GET Lead By ID
  {
    method: 'GET',
    path: '/leads/{id}',
    handler: getLeadByIdHandler,
  },

  // POST Add New Lead
  {
    method: 'POST',
    path: '/leads',
    handler: addLeadHandler,
    options: {
      validate: {
        payload: leadPayloadSchema,
      },
    },
  },

  // PUT Update Lead Info
  {
    method: 'PUT',
    path: '/leads/{id}',
    handler: updateLeadInfoHandler,
    options: {
      validate: {
        payload: leadPayloadSchema,
      },
    },
  },

  // DELETE Lead
  {
    method: 'DELETE',
    path: '/leads/{id}',
    handler: deleteLeadHandler,
  },

  // PUT Update Status
  {
    method: 'PUT',
    path: '/leads/{id}/status',
    handler: updateLeadStatusHandler,
    options: {
      validate: {
        payload: Joi.object({
          status: Joi.string()
            .valid('pending', 'contacted', 'converted', 'rejected')
            .required(),
          userId: Joi.string().required(),
        }),
      },
    },
  },

  // PUT Update Notes
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

  // POST Refresh ML Scores
  {
    method: 'POST',
    path: '/leads/refresh-ml',
    handler: refreshLeadsWithMLHandler,
  },


  {
    method: 'GET',
    path: '/users/{id}/leads-history',   
    handler: getSalesHistoryByUserHandler,
    options: {
      validate: {
        params: Joi.object({ id: Joi.string().required() }),
      },
    },
  },

  
  {
    method: 'GET',
    path: '/users/{id}/leads',
    handler: getLeadsByUserHandler,
    options: {
      validate: {
        params: Joi.object({ id: Joi.string().required() }),
      },
    },
  },
];

module.exports = routes;
