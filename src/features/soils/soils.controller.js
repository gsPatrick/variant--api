const catchAsync = require('../../utils/catch-async');
const { sendSuccess } = require('../../utils/api-response');
const AppError = require('../../utils/app-error');
const soilsService = require('./soils.service');

// POST /plots/:plotId/soil-analyses/import — importa a planilha (admin).
const importAnalyses = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError('Envie o arquivo no campo "arquivo".', 400, 'NO_FILE');
  }
  const result = await soilsService.importSpreadsheet(req.plot, req.file.buffer, req.file.originalname);
  return sendSuccess(res, { statusCode: 201, data: result, message: 'Importacao concluida.' });
});

// GET /plots/:plotId/soil-analyses — lista as análises do talhão.
const list = catchAsync(async (req, res) => {
  const result = await soilsService.listAnalyses(req.plot);
  return sendSuccess(res, { data: result });
});

// DELETE /plots/:plotId/soil-analyses/:analysisId — exclui uma análise (admin).
const remove = catchAsync(async (req, res) => {
  await soilsService.removeAnalysis(req.plot, req.params.analysisId);
  return sendSuccess(res, { message: 'Analise removida.' });
});

// GET /plots/:plotId/soil-analyses/depths — profundidades com análise.
const depths = catchAsync(async (req, res) => {
  const result = await soilsService.availableDepths(req.plot);
  return sendSuccess(res, { data: result });
});

// GET /plots/:plotId/soil-analyses/evolution?nutriente=calcio&depth=20 cm
const evolution = catchAsync(async (req, res) => {
  const nutriente = String(req.query.nutriente || '').trim().toLowerCase();
  const depth = req.query.depth ? String(req.query.depth).trim() : null;
  const result = await soilsService.evolution(req.plot, nutriente, depth);
  return sendSuccess(res, { data: result });
});

// GET /plots/:plotId/soil-analyses/radar?year=2024&depth=20 cm
const radar = catchAsync(async (req, res) => {
  const parsedYear = Number.parseInt(req.query.year, 10);
  const depth = req.query.depth ? String(req.query.depth).trim() : null;
  const result = await soilsService.radar(req.plot, Number.isNaN(parsedYear) ? null : parsedYear, depth);
  return sendSuccess(res, { data: result });
});

module.exports = { importAnalyses, evolution, radar, depths, list, remove };
