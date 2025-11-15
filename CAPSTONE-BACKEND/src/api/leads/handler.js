let leads = require('../../data/leads'); // Gunakan let karena data akan dimutasi

const getLeadsHandler = (request, h) => {
  // Simulasi loading 1.5 detik
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(h.response(leads).code(200));
    }, 1500);
  });
};

const getLeadByIdHandler = (request, h) => {
  const { id } = request.params;
  const lead = leads.find((l) => l.id === id);

  if (lead) {
    // Simulasi loading 0.5 detik
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(h.response(lead).code(200));
      }, 500);
    });
  }

  return h.response({ message: 'Lead not found' }).code(404);
};

const updateLeadStatusHandler = (request, h) => {
  const { id } = request.params;
  const { status } = request.payload;

  const index = leads.findIndex((l) => l.id === id);

  if (index !== -1) {
    leads[index] = {
      ...leads[index],
      status: status,
      contactedAt: new Date(),
    };
    return h.response(leads[index]).code(200);
  }

  return h.response({ message: 'Lead not found' }).code(404);
};

const updateLeadNotesHandler = (request, h) => {
  const { id } = request.params;
  const { notes } = request.payload;

  const index = leads.findIndex((l) => l.id === id);

  if (index !== -1) {
    leads[index] = {
      ...leads[index],
      notes: notes,
    };
    return h.response(leads[index]).code(200);
  }

  return h.response({ message: 'Lead not found' }).code(404);
};


module.exports = {
  getLeadsHandler,
  getLeadByIdHandler,
  updateLeadStatusHandler,
  updateLeadNotesHandler,
};