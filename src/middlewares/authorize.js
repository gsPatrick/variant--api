const AppError = require('../utils/app-error');

// Restringe o acesso a determinados papeis. Deve ser usado apos `authenticate`.
// Uso: router.use(authenticate, authorize(USER_ROLES.ADMIN))
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Nao autenticado.', 401, 'UNAUTHENTICATED'));
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return next(new AppError('Acesso negado para o seu perfil.', 403, 'FORBIDDEN'));
    }
    return next();
  };
}

module.exports = authorize;
