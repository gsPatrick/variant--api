const catchAsync = require('../../utils/catch-async');
const { sendSuccess } = require('../../utils/api-response');
const AppError = require('../../utils/app-error');
const plotsService = require('./plots.service');

// POST /plots (admin)
const create = catchAsync(async (req, res) => {
  const plot = await plotsService.createPlot(req.body || {});
  return sendSuccess(res, { statusCode: 201, data: plot, message: 'Talhao criado.' });
});

// GET /plots
const list = catchAsync(async (req, res) => {
  const plots = await plotsService.listPlots(req.user, req.query);
  return sendSuccess(res, { data: plots });
});

// GET /plots/:plotId
const getOne = catchAsync(async (req, res) => {
  return sendSuccess(res, { data: plotsService.getPlot(req.plot) });
});

// PUT /plots/:plotId (admin)
const update = catchAsync(async (req, res) => {
  const plot = await plotsService.updatePlot(req.plot, req.body || {});
  return sendSuccess(res, { data: plot, message: 'Talhao atualizado.' });
});

// DELETE /plots/:plotId (admin)
const remove = catchAsync(async (req, res) => {
  await plotsService.removePlot(req.plot);
  return sendSuccess(res, { message: 'Talhao removido.' });
});

// POST /plots/:plotId/kml — upload do contorno (admin).
const uploadKml = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError('Envie o arquivo KML no campo "arquivo".', 400, 'NO_FILE');
  }
  const result = await plotsService.updateKml(req.plot, req.file.buffer, req.file.originalname);
  return sendSuccess(res, { data: result, message: 'Contorno do talhao atualizado.' });
});

// GET /plots/:plotId/map — contorno + safra ativa.
const mapData = catchAsync(async (req, res) => {
  const result = await plotsService.getMapData(req.plot);
  return sendSuccess(res, { data: result });
});

module.exports = { create, list, getOne, update, remove, uploadKml, mapData };
