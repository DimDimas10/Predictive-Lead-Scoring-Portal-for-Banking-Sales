const Joi = require('joi');

// IMPORT SEMUA HANDLER (Destructuring)
// Pastikan handler.js sudah mengekspor fungsi-fungsi ini
const {
  getLeadsHandler,
  getLeadByIdHandler,
  addLeadHandler,
  updateLeadInfoHandler,
  deleteLeadHandler,
  updateLeadStatusHandler,
  updateLeadNotesHandler,
  refreshLeadsWithMLHandler,
} = require('./handler');

// Schema Validasi Joi untuk Create/Update
// Field ini harus cocok dengan data yang dikirim dari Frontend (AdminManagementPage.tsx)
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
  poutcome: Joi.string().allow('', null).default('nonexistent'), // Cocok dengan handler (poutcome)
  contact: Joi.string().allow('', null).default('cellular'),
  notes: Joi.string().allow('', null)
});

const routes = [
  // 1. GET All Leads (Read)
  {
    method: 'GET',
    path: '/leads',
    handler: getLeadsHandler,
  },
  
  // 2. GET Lead By ID (Read Detail)
  {
    method: 'GET',
    path: '/leads/{id}',
    handler: getLeadByIdHandler,
  },

  // 3. POST Add New Lead (Create)
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

  // 4. PUT Update Lead Info (Update Full Profile)
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

  // 5. DELETE Lead (Delete)
  {
    method: 'DELETE',
    path: '/leads/{id}',
    handler: deleteLeadHandler,
  },

  // 6. PUT Update Status (Specific Action)
  {
    method: 'PUT',
    path: '/leads/{id}/status',
    handler: updateLeadStatusHandler,
    options: {
      validate: {
        payload: Joi.object({
          // Validasi status harus sesuai dengan constraint di database
          status: Joi.string().valid('pending', 'contacted', 'converted', 'rejected').required(),
          userId: Joi.string().required(),   
        }),
      },
    },
  },

  // 7. PUT Update Notes (Specific Action)
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

  // 8. POST Refresh ML Scores (Trigger Python Script)
  {
    method: 'POST',
    path: '/leads/refresh-ml',
    handler: refreshLeadsWithMLHandler, 
  },
];

module.exports = routes;