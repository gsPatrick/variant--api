const { Farm, User } = require('../../models');
const AppError = require('../../utils/app-error');
const v = require('../../utils/validation');
const { USER_ROLES } = require('../../config/constants');

function toPublicFarm(farm) {
  return {
    id: farm.id,
    producerId: farm.producerId,
    name: farm.name,
    city: farm.city,
    state: farm.state,
    totalAreaHa: farm.totalAreaHa,
    centroidLat: farm.centroidLat,
    centroidLng: farm.centroidLng,
    createdAt: farm.createdAt,
    updatedAt: farm.updatedAt,
  };
}

// Valida campos comuns de fazenda. Em modo partial (update), so valida os
// campos presentes; em create, exige name (e producerId, validado a parte).
function validateFarm(payload, { partial }) {
  const errors = [];

  if (!partial || v.isPresent(payload.name)) {
    if (!v.isNonEmptyString(payload.name)) {
      errors.push({ field: 'name', message: 'name e obrigatorio.' });
    }
  }
  if (v.isPresent(payload.state) && (!v.isNonEmptyString(payload.state) || payload.state.trim().length !== 2)) {
    errors.push({ field: 'state', message: 'state deve ter 2 caracteres (UF).' });
  }
  if (v.isPresent(payload.totalAreaHa) && !v.isFiniteNumber(payload.totalAreaHa)) {
    errors.push({ field: 'totalAreaHa', message: 'totalAreaHa deve ser numerico.' });
  }
  if (v.isPresent(payload.centroidLat) && !v.isFiniteNumber(payload.centroidLat)) {
    errors.push({ field: 'centroidLat', message: 'centroidLat deve ser numerico.' });
  }
  if (v.isPresent(payload.centroidLng) && !v.isFiniteNumber(payload.centroidLng)) {
    errors.push({ field: 'centroidLng', message: 'centroidLng deve ser numerico.' });
  }

  return errors;
}

// Garante que producerId referencia um usuario produtor existente.
async function assertProducer(producerId) {
  if (!v.isNonEmptyString(producerId)) {
    throw v.validationError([{ field: 'producerId', message: 'producerId e obrigatorio.' }]);
  }
  const producer = await User.findByPk(producerId);
  if (!producer) {
    throw new AppError('Produtor informado nao existe.', 404, 'CLIENT_NOT_FOUND');
  }
  if (producer.role !== USER_ROLES.PRODUCER) {
    throw new AppError('O usuario informado nao e um produtor.', 422, 'CLIENT_NOT_PRODUCER');
  }
  return producer;
}

// CREATE (admin).
async function createFarm(payload) {
  const errors = validateFarm(payload, { partial: false });
  if (errors.length > 0) throw v.validationError(errors);
  await assertProducer(payload.producerId);

  const farm = await Farm.create({
    producerId: payload.producerId,
    name: payload.name.trim(),
    city: v.isNonEmptyString(payload.city) ? payload.city.trim() : null,
    state: v.isNonEmptyString(payload.state) ? payload.state.trim().toUpperCase() : null,
    totalAreaHa: v.isFiniteNumber(payload.totalAreaHa) ? payload.totalAreaHa : null,
    centroidLat: v.isFiniteNumber(payload.centroidLat) ? payload.centroidLat : null,
    centroidLng: v.isFiniteNumber(payload.centroidLng) ? payload.centroidLng : null,
  });
  return toPublicFarm(farm);
}

// LIST. Admin ve todas (filtro opcional ?producerId); produtor ve apenas as
// suas (forcado pelo proprio id).
async function listFarms(user, query) {
  const where = {};
  if (user.role === USER_ROLES.PRODUCER) {
    where.producerId = user.id;
  } else if (v.isNonEmptyString(query.producerId)) {
    where.producerId = query.producerId;
  }

  const farms = await Farm.findAll({ where, order: [['created_at', 'DESC']] });
  return farms.map(toPublicFarm);
}

// READ ONE (a fazenda ja foi carregada e tenant-checada pelo middleware).
function getFarm(farm) {
  return toPublicFarm(farm);
}

// UPDATE (admin).
async function updateFarm(farm, payload) {
  const errors = validateFarm(payload, { partial: true });
  if (errors.length > 0) throw v.validationError(errors);

  // Permite reatribuir a fazenda a outro produtor (controle total do admin).
  if (v.isPresent(payload.producerId)) {
    await assertProducer(payload.producerId);
    farm.producerId = payload.producerId;
  }
  if (v.isPresent(payload.name)) farm.name = payload.name.trim();
  if (v.isPresent(payload.city)) farm.city = v.isNonEmptyString(payload.city) ? payload.city.trim() : null;
  if (v.isPresent(payload.state)) farm.state = v.isNonEmptyString(payload.state) ? payload.state.trim().toUpperCase() : null;
  if (v.isPresent(payload.totalAreaHa)) farm.totalAreaHa = v.isFiniteNumber(payload.totalAreaHa) ? payload.totalAreaHa : null;
  if (v.isPresent(payload.centroidLat)) farm.centroidLat = v.isFiniteNumber(payload.centroidLat) ? payload.centroidLat : null;
  if (v.isPresent(payload.centroidLng)) farm.centroidLng = v.isFiniteNumber(payload.centroidLng) ? payload.centroidLng : null;

  await farm.save();
  return toPublicFarm(farm);
}

// DELETE (admin). O cascade do banco remove talhoes/safras/analises associados.
async function removeFarm(farm) {
  await farm.destroy();
}

module.exports = { createFarm, listFarms, getFarm, updateFarm, removeFarm, toPublicFarm };
