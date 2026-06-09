const catchAsync = require('../../utils/catch-async');
const { sendSuccess } = require('../../utils/api-response');
const farmsService = require('./farms.service');

// POST /farms (admin)
const create = catchAsync(async (req, res) => {
  const farm = await farmsService.createFarm(req.body || {});
  return sendSuccess(res, { statusCode: 201, data: farm, message: 'Fazenda criada.' });
});

// GET /farms
const list = catchAsync(async (req, res) => {
  const farms = await farmsService.listFarms(req.user, req.query);
  return sendSuccess(res, { data: farms });
});

// GET /farms/:farmId
const getOne = catchAsync(async (req, res) => {
  return sendSuccess(res, { data: farmsService.getFarm(req.farm) });
});

// PUT /farms/:farmId (admin)
const update = catchAsync(async (req, res) => {
  const farm = await farmsService.updateFarm(req.farm, req.body || {});
  return sendSuccess(res, { data: farm, message: 'Fazenda atualizada.' });
});

// DELETE /farms/:farmId (admin)
const remove = catchAsync(async (req, res) => {
  await farmsService.removeFarm(req.farm);
  return sendSuccess(res, { message: 'Fazenda removida.' });
});

module.exports = { create, list, getOne, update, remove };
