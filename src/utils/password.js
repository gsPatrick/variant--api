const bcrypt = require('bcryptjs');
const { saltRounds } = require('../config/auth');

// Hash e verificacao de senhas. A senha em claro nunca e persistida nem logada.
async function hashPassword(plain) {
  return bcrypt.hash(plain, saltRounds);
}

async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = { hashPassword, comparePassword };
