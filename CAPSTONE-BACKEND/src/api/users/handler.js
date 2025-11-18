const users = require('../../data/users');

const loginHandler = (request, h) => {
  const { email, password } = request.payload;

  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    const { password, ...userData } = user;
    return h.response(userData).code(200);
  }

  return h.response({ message: 'Email atau password salah.' }).code(401);
};


module.exports = { loginHandler };
