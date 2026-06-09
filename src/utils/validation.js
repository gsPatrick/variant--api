// Validadores primitivos puros, reutilizaveis pelas features.
// Mantidos explicitos (sem lib externa) para legibilidade e zero dependencia.

const AppError = require('./app-error');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isPresent(value) {
  return value !== undefined && value !== null;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isEmail(value) {
  return isNonEmptyString(value) && EMAIL_RE.test(value.trim());
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Monta um AppError 400 padronizado a partir de uma lista de erros de campo.
function validationError(errors) {
  const error = new AppError('Dados invalidos.', 400, 'VALIDATION_ERROR');
  error.details = errors;
  return error;
}

module.exports = {
  isPresent,
  isNonEmptyString,
  isEmail,
  isFiniteNumber,
  isPlainObject,
  isArray: Array.isArray,
  validationError,
};
