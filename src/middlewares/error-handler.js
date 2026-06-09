const AppError = require('../utils/app-error');

// Middleware de erro unico da aplicacao. Normaliza qualquer erro em um
// payload JSON estavel { error: { code, message } }.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Erros de validacao/constraint do Sequelize viram 400/409 legiveis.
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const message = err.errors?.map((e) => e.message).join('; ') || 'Dados invalidos.';
    const statusCode = err.name === 'SequelizeUniqueConstraintError' ? 409 : 400;
    return res.status(statusCode).json({
      error: { code: 'VALIDATION_ERROR', message },
    });
  }

  // Erros do multer (tamanho/arquivo) viram 400 legivel.
  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: { code: 'UPLOAD_ERROR', message: `Falha no upload: ${err.message}.` },
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        // Erros de validacao podem carregar a lista de campos invalidos.
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  // Erro nao previsto: registra para diagnostico e responde generico.
  console.error('[unhandled-error]', err);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Erro interno no servidor.' },
  });
}

module.exports = errorHandler;
