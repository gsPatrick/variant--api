const catchAsync = require('../../utils/catch-async');
const { sendSuccess } = require('../../utils/api-response');
const seasonsService = require('./seasons.service');

// POST /seasons (admin)
const create = catchAsync(async (req, res) => {
  const season = await seasonsService.createSeason(req.body || {});
  return sendSuccess(res, { statusCode: 201, data: season, message: 'Safra criada.' });
});

// GET /seasons
const list = catchAsync(async (req, res) => {
  const seasons = await seasonsService.listSeasons(req.user, req.query);
  return sendSuccess(res, { data: seasons });
});

// GET /seasons/:seasonId
const getOne = catchAsync(async (req, res) => {
  return sendSuccess(res, { data: seasonsService.getSeason(req.season) });
});

// PUT /seasons/:seasonId (admin)
const update = catchAsync(async (req, res) => {
  const season = await seasonsService.updateSeason(req.season, req.body || {});
  return sendSuccess(res, { data: season, message: 'Safra atualizada.' });
});

// DELETE /seasons/:seasonId (admin)
const remove = catchAsync(async (req, res) => {
  await seasonsService.removeSeason(req.season);
  return sendSuccess(res, { message: 'Safra removida.' });
});

// GET /seasons/:seasonId/events — timeline ordenada.
const listEvents = catchAsync(async (req, res) => {
  const result = await seasonsService.listEvents(req.season);
  return sendSuccess(res, { data: result });
});

// POST /seasons/:seasonId/events — cadastra evento (admin), com foto opcional.
const createEvent = catchAsync(async (req, res) => {
  const result = await seasonsService.createEvent(req.season, req.body || {}, req.file || null);
  return sendSuccess(res, { statusCode: 201, data: result, message: 'Evento cadastrado.' });
});

// PUT /seasons/:seasonId/events/:eventId (admin)
const updateEvent = catchAsync(async (req, res) => {
  const result = await seasonsService.updateEvent(req.season, req.params.eventId, req.body || {}, req.file || null);
  return sendSuccess(res, { data: result, message: 'Evento atualizado.' });
});

// DELETE /seasons/:seasonId/events/:eventId (admin)
const removeEvent = catchAsync(async (req, res) => {
  await seasonsService.removeEvent(req.season, req.params.eventId);
  return sendSuccess(res, { message: 'Evento removido.' });
});

module.exports = { create, list, getOne, update, remove, listEvents, createEvent, updateEvent, removeEvent };
