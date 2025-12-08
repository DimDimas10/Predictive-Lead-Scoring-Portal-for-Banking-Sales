const routes = require('./routes');

module.exports = {
  name: 'api-leads',
  version: '1.0.0',
  register: async (server, options) => {
    server.route(routes);
  },
};