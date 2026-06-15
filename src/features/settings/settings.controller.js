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

// GET /settings/social-links — admin e produtor (a sidebar exibe os ícones).
const getSocialLinks = catchAsync(async (req, res) => {
  const result = await settingsService.getSocialLinks();
  return sendSuccess(res, { data: result });
});

// PUT /settings/social-links — apenas administrador.
const updateSocialLinks = catchAsync(async (req, res) => {
  const result = await settingsService.saveSocialLinks(req.body?.links || req.body || {});
  return sendSuccess(res, { data: result, message: 'Links das redes sociais atualizados.' });
});

module.exports = { getRadarIdeals, updateRadarIdeals, getSocialLinks, updateSocialLinks };
