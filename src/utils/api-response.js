// Resposta HTTP de sucesso padronizada: sempre { data, [message] }.
// Erros seguem o formato { error: { code, message, [details] } } no error-handler.
function sendSuccess(res, { statusCode = 200, data = null, message } = {}) {
  const body = { data };
  if (message) body.message = message;
  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess };
