const catchAsync = require('../../utils/catch-async');
const { sendSuccess } = require('../../utils/api-response');
const onboardingService = require('./onboarding.service');

// POST /onboarding/preview — modo confirmacao: valida e devolve o resumo do
// que sera criado, sem gravar nada. Alimenta o modal passo-a-passo.
const preview = catchAsync(async (req, res) => {
  const result = await onboardingService.preview(req.body);
  return sendSuccess(res, { data: result });
});

// POST /onboarding — cria cliente + projeto + talhoes atomicamente.
// Usado tanto pelo modo automatico quanto pela confirmacao final.
const create = catchAsync(async (req, res) => {
  const result = await onboardingService.execute(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    data: result,
    message: 'Cadastro criado com sucesso.',
  });
});

module.exports = { preview, create };
