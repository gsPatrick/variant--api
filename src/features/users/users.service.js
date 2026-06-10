const { User, Farm, Plot } = require('../../models');
const AppError = require('../../utils/app-error');
const v = require('../../utils/validation');
const { hashPassword } = require('../../utils/password');
const { USER_ROLES } = require('../../config/constants');

const nestedInclude = [{ model: Farm, as: 'farms', include: [{ model: Plot, as: 'plots' }] }];

// Projeta o produtor com a hierarquia fazendas -> talhoes (para a arvore e a tabela).
function toPublic(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    document: user.document,
    active: user.active,
    farms: (user.farms || []).map((f) => ({
      id: f.id,
      name: f.name,
      city: f.city,
      state: f.state,
      totalAreaHa: f.totalAreaHa,
      centroidLat: f.centroidLat,
      centroidLng: f.centroidLng,
      plots: (f.plots || []).map((p) => ({
        id: p.id,
        name: p.name,
        areaHa: p.areaHa,
        centroidLat: p.centroidLat,
        centroidLng: p.centroidLng,
        geometry: p.geometry,
        kmlFilename: p.kmlFilename,
      })),
    })),
  };
}

async function listProducers() {
  const users = await User.findAll({
    where: { role: USER_ROLES.PRODUCER },
    order: [['name', 'ASC']],
    include: nestedInclude,
  });
  return users.map(toPublic);
}

async function updateUser(id, payload) {
  const user = await User.findByPk(id);
  if (!user) throw new AppError('Usuario nao encontrado.', 404, 'USER_NOT_FOUND');

  const errors = [];
  if (v.isPresent(payload.name) && !v.isNonEmptyString(payload.name)) {
    errors.push({ field: 'name', message: 'name invalido.' });
  }
  if (v.isPresent(payload.email) && !v.isEmail(payload.email)) {
    errors.push({ field: 'email', message: 'email invalido.' });
  }
  if (v.isNonEmptyString(payload.password) && payload.password.length < 6) {
    errors.push({ field: 'password', message: 'senha deve ter ao menos 6 caracteres.' });
  }
  if (errors.length > 0) throw v.validationError(errors);

  if (v.isPresent(payload.name)) user.name = payload.name.trim();
  if (v.isPresent(payload.email)) user.email = payload.email.trim().toLowerCase();
  if (v.isPresent(payload.document)) {
    user.document = v.isNonEmptyString(payload.document) ? payload.document.trim() : null;
  }
  if (v.isPresent(payload.active)) user.active = Boolean(payload.active);
  if (v.isNonEmptyString(payload.password)) user.passwordHash = await hashPassword(payload.password);

  await user.save();

  const fresh = await User.findByPk(id, { include: nestedInclude });
  return toPublic(fresh);
}

async function removeUser(id) {
  const user = await User.findByPk(id);
  if (!user) throw new AppError('Usuario nao encontrado.', 404, 'USER_NOT_FOUND');
  await user.destroy();
}

module.exports = { listProducers, updateUser, removeUser };
