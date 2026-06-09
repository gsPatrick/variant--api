// Erro operacional com statusCode e code estaveis para o cliente.
// Lancar AppError em qualquer camada; o error-handler converte em resposta JSON.
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    // Marca erros previstos (de negocio/validacao) para distinguir de bugs.
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
