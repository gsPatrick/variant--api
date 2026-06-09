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

// GET /plots/:plotId/soil-analyses/evolution?nutriente=calcio
const evolution = catchAsync(async (req, res) => {
  const nutriente = String(req.query.nutriente || '').trim().toLowerCase();
  const result = await soilsService.evolution(req.plot, nutriente);
  return sendSuccess(res, { data: result });
});

// GET /plots/:plotId/soil-analyses/radar?year=2024
const radar = catchAsync(async (req, res) => {
  const parsedYear = Number.parseInt(req.query.year, 10);
  const result = await soilsService.radar(req.plot, Number.isNaN(parsedYear) ? null : parsedYear);
  return sendSuccess(res, { data: result });
});

module.exports = { importAnalyses, evolution, radar };
