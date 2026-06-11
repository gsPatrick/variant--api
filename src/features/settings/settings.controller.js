const catchAsync = require('../../utils/catch-async');
const { sendSuccess } = require('../../utils/api-response');
const settingsService = require('./settings.service');

// GET /settings/radar-ideals — admin e produtor (o radar usa para calcular o nível).
const getRadarIdeals = catchAsync(async (req, res) => {
  const result = await settingsService.getRadarIdeals();
  return sendSuccess(res, { data: result });
});

// PUT /settings/radar-ideals — apenas administrador.
const updateRadarIdeals = catchAsync(async (req, res) => {
  const result = await settingsService.saveRadarIdeals(req.body?.ideals || req.body || {});
  return sendSuccess(res, { data: result, message: 'Valores ideais atualizados.' });
});

module.exports = { getRadarIdeals, updateRadarIdeals };
