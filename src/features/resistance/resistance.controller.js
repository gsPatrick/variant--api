const catchAsync = require('../../utils/catch-async');
const { sendSuccess } = require('../../utils/api-response');
const resistanceService = require('./resistance.service');

// GET /plots/:plotId/resistance — leituras de compactacao (admin ou produtor).
const list = catchAsync(async (req, res) => {
  const result = await resistanceService.list(req.plot);
  return sendSuccess(res, { data: result });
});

// PUT /plots/:plotId/resistance — substitui o conjunto de leituras (admin).
const replace = catchAsync(async (req, res) => {
  const result = await resistanceService.replace(req.plot, req.body?.readings);
  return sendSuccess(res, { data: result, message: 'Resistencia do solo atualizada.' });
});

module.exports = { list, replace };
