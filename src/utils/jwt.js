const jwt = require('jsonwebtoken');
const AppError = require('./app-error');
const { jwtSecret, accessTokenExpiresIn } = require('../config/auth');

// Falha cedo e de forma clara se o segredo nao estiver configurado.
function ensureSecret() {
  if (!jwtSecret) {
    throw new AppError('JWT_SECRET nao configurado no ambiente.', 500, 'CONFIG_ERROR');
  }
}

// Access token (JWT curto). type='access' diferencia de outros usos futuros.
function signAccessToken(payload) {
  ensureSecret();
  return jwt.sign({ ...payload, type: 'access' }, jwtSecret, {
    expiresIn: accessTokenExpiresIn,
  });
}

function verifyToken(token) {
  ensureSecret();
  return jwt.verify(token, jwtSecret);
}

module.exports = { signAccessToken, verifyToken, accessTokenExpiresIn };
