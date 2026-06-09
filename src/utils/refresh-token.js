const crypto = require('crypto');

// Refresh tokens sao opacos e aleatorios (nao JWT), guardados no banco apenas
// como hash SHA-256. Isso permite revogacao real (logout) e rotacao segura.
function generateRefreshToken() {
  return crypto.randomBytes(48).toString('hex');
}

function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = { generateRefreshToken, hashRefreshToken };
