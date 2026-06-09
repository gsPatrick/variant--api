const AppError = require('../utils/app-error');
const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');

// Autentica via Bearer token (JWT). Em sucesso popula req.user com o
// usuario atual; caso contrario encaminha 401 ao error-handler.
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new AppError('Token de autenticacao ausente.', 401, 'UNAUTHENTICATED');
    }

    const payload = verifyToken(token);
    const user = await User.findByPk(payload.sub);

    if (!user || !user.active) {
      throw new AppError('Usuario invalido ou inativo.', 401, 'UNAUTHENTICATED');
    }

    req.user = {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    };
    return next();
  } catch (err) {
    // Erros de negocio ja formatados passam adiante; erros do jwt viram 401.
    if (err.isOperational) return next(err);
    return next(new AppError('Token invalido ou expirado.', 401, 'UNAUTHENTICATED'));
  }
}

module.exports = authenticate;
