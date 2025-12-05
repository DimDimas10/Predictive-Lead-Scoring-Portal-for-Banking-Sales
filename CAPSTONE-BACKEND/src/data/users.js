// Hardcode password 'demo123' untuk user 'sales@bank.com'
const users = [
  {
    id: '1',
    name: 'Andi Wijaya',
    email: 'sales@bank.com',
    role: 'admin',
    password: 'demo123' // Di dunia nyata, ini harus di-hash
  }
];

module.exports = users;