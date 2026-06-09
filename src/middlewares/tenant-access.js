const AppError = require('../utils/app-error');
const { Plot, Farm, Season } = require('../models');
const { USER_ROLES } = require('../config/constants');

// Multi-tenancy: admin ve tudo; produtor so acessa recursos das suas fazendas.
function isAllowed(user, farmProducerId) {
  return user.role === USER_ROLES.ADMIN || farmProducerId === user.id;
}

// Carrega a fazenda a partir de req.params.farmId, aplica o filtro de tenant
// e anexa req.farm. Use apos `authenticate`.
async function resolveFarmAccess(req, res, next) {
  try {
    const farm = await Farm.findByPk(req.params.farmId);

    if (!farm) {
      throw new AppError('Fazenda nao encontrada.', 404, 'FARM_NOT_FOUND');
    }
    if (!isAllowed(req.user, farm.producerId)) {
      throw new AppError('Acesso negado a esta fazenda.', 403, 'FORBIDDEN');
    }

    req.farm = farm;
    return next();
  } catch (err) {
    return next(err);
  }
}

// Carrega o talhao (com a fazenda) a partir de req.params.plotId, aplica o
// filtro de tenant e anexa req.plot. Use apos `authenticate`.
async function resolvePlotAccess(req, res, next) {
  try {
    const plot = await Plot.findByPk(req.params.plotId, {
      include: [{ model: Farm, as: 'farm' }],
    });

    if (!plot || !plot.farm) {
      throw new AppError('Talhao nao encontrado.', 404, 'PLOT_NOT_FOUND');
    }
    if (!isAllowed(req.user, plot.farm.producerId)) {
      throw new AppError('Acesso negado a este talhao.', 403, 'FORBIDDEN');
    }

    req.plot = plot;
    return next();
  } catch (err) {
    return next(err);
  }
}

// Carrega a safra (com talhao -> fazenda) a partir de req.params.seasonId,
// aplica o filtro de tenant e anexa req.season e req.plot.
async function resolveSeasonAccess(req, res, next) {
  try {
    const season = await Season.findByPk(req.params.seasonId, {
      include: [{ model: Plot, as: 'plot', include: [{ model: Farm, as: 'farm' }] }],
    });

    if (!season || !season.plot || !season.plot.farm) {
      throw new AppError('Safra nao encontrada.', 404, 'SEASON_NOT_FOUND');
    }
    if (!isAllowed(req.user, season.plot.farm.producerId)) {
      throw new AppError('Acesso negado a esta safra.', 403, 'FORBIDDEN');
    }

    req.season = season;
    req.plot = season.plot;
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { resolveFarmAccess, resolvePlotAccess, resolveSeasonAccess };
