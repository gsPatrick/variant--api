const { Plot, Farm, Season } = require('../../models');
const AppError = require('../../utils/app-error');
const v = require('../../utils/validation');
const { USER_ROLES } = require('../../config/constants');
const { kmlToGeoJson, hasPolygon, computeCentroid } = require('../../utils/geo');

// Arredonda coordenada para 7 casas (compatível com DECIMAL(10,7)).
function round7(value) {
  return value === null || value === undefined ? null : Math.round(value * 1e7) / 1e7;
}

function toPublicPlot(plot) {
  return {
    id: plot.id,
    farmId: plot.farmId,
    name: plot.name,
    areaHa: plot.areaHa,
    kmlFilename: plot.kmlFilename,
    centroid: { lat: plot.centroidLat, lng: plot.centroidLng },
    geometry: plot.geometry,
    createdAt: plot.createdAt,
    updatedAt: plot.updatedAt,
  };
}

// Converte o KML em GeoJSON, calcula o centroide e atualiza o talhao.
async function updateKml(plot, fileBuffer, originalName) {
  const geojson = kmlToGeoJson(fileBuffer.toString('utf-8'));

  if (!hasPolygon(geojson)) {
    throw new AppError('O KML nao contem poligonos validos.', 422, 'INVALID_KML');
  }

  const centroid = computeCentroid(geojson);

  plot.geometry = geojson;
  plot.kmlFilename = originalName || plot.kmlFilename;
  if (centroid) {
    plot.centroidLat = round7(centroid.lat);
    plot.centroidLng = round7(centroid.lng);
  }
  await plot.save();

  return {
    id: plot.id,
    name: plot.name,
    kmlFilename: plot.kmlFilename,
    centroid: { lat: plot.centroidLat, lng: plot.centroidLng },
    geometry: plot.geometry,
  };
}

// Define a safra "ativa" como a mais recente (maior ano / data de inicio).
function pickActiveSeason() {
  return {
    order: [
      ['year', 'DESC'],
      ['start_date', 'DESC'],
      ['created_at', 'DESC'],
    ],
  };
}

// Dados para o mapa: contorno (GeoJSON) do talhao + safra ativa (marcador).
async function getMapData(plot) {
  const activeSeason = await Season.findOne({
    where: { plotId: plot.id },
    ...pickActiveSeason(),
  });

  return {
    talhao: {
      id: plot.id,
      name: plot.name,
      areaHa: plot.areaHa,
      geometry: plot.geometry,
      centroid: { lat: plot.centroidLat, lng: plot.centroidLng },
    },
    safraAtiva: activeSeason
      ? {
          id: activeSeason.id,
          crop: activeSeason.crop,
          variety: activeSeason.variety,
          seasonLabel: activeSeason.seasonLabel,
          year: activeSeason.year,
          // Marcador da safra; se ausente, cai no centroide do talhao.
          marker: {
            lat: activeSeason.markerLat ?? plot.centroidLat,
            lng: activeSeason.markerLng ?? plot.centroidLng,
          },
        }
      : null,
  };
}

// ----- CRUD (controle total do admin) -----

function validatePlot(payload, { partial }) {
  const errors = [];
  if (!partial || v.isPresent(payload.name)) {
    if (!v.isNonEmptyString(payload.name)) {
      errors.push({ field: 'name', message: 'name e obrigatorio.' });
    }
  }
  if (v.isPresent(payload.areaHa) && !v.isFiniteNumber(payload.areaHa)) {
    errors.push({ field: 'areaHa', message: 'areaHa deve ser numerico.' });
  }
  if (v.isPresent(payload.centroidLat) && !v.isFiniteNumber(payload.centroidLat)) {
    errors.push({ field: 'centroidLat', message: 'centroidLat deve ser numerico.' });
  }
  if (v.isPresent(payload.centroidLng) && !v.isFiniteNumber(payload.centroidLng)) {
    errors.push({ field: 'centroidLng', message: 'centroidLng deve ser numerico.' });
  }
  if (v.isPresent(payload.geometry) && !v.isPlainObject(payload.geometry)) {
    errors.push({ field: 'geometry', message: 'geometry deve ser um objeto GeoJSON.' });
  }
  return errors;
}

async function assertFarmExists(farmId) {
  if (!v.isNonEmptyString(farmId)) {
    throw v.validationError([{ field: 'farmId', message: 'farmId e obrigatorio.' }]);
  }
  const farm = await Farm.findByPk(farmId);
  if (!farm) {
    throw new AppError('Fazenda informada nao existe.', 404, 'FARM_NOT_FOUND');
  }
  return farm;
}

// CREATE (admin).
async function createPlot(payload) {
  const errors = validatePlot(payload, { partial: false });
  if (errors.length > 0) throw v.validationError(errors);
  await assertFarmExists(payload.farmId);

  const plot = await Plot.create({
    farmId: payload.farmId,
    name: payload.name.trim(),
    areaHa: v.isFiniteNumber(payload.areaHa) ? payload.areaHa : null,
    geometry: v.isPlainObject(payload.geometry) ? payload.geometry : null,
    kmlFilename: v.isNonEmptyString(payload.kmlFilename) ? payload.kmlFilename.trim() : null,
    centroidLat: v.isFiniteNumber(payload.centroidLat) ? round7(payload.centroidLat) : null,
    centroidLng: v.isFiniteNumber(payload.centroidLng) ? round7(payload.centroidLng) : null,
  });
  return toPublicPlot(plot);
}

// LIST. Produtor: apenas talhoes de suas fazendas. Admin: todos (filtro ?farmId).
async function listPlots(user, query) {
  const where = {};
  if (v.isNonEmptyString(query.farmId)) {
    where.farmId = query.farmId;
  }

  // Para o produtor, restringe via JOIN na fazenda (producer_id).
  const include =
    user.role === USER_ROLES.PRODUCER
      ? [{ model: Farm, as: 'farm', attributes: [], where: { producerId: user.id } }]
      : [];

  const plots = await Plot.findAll({ where, include, order: [['created_at', 'DESC']] });
  return plots.map(toPublicPlot);
}

// READ ONE (plot ja carregado/tenant-checado pelo middleware).
function getPlot(plot) {
  return toPublicPlot(plot);
}

// UPDATE (admin).
async function updatePlot(plot, payload) {
  const errors = validatePlot(payload, { partial: true });
  if (errors.length > 0) throw v.validationError(errors);

  if (v.isPresent(payload.farmId)) {
    await assertFarmExists(payload.farmId);
    plot.farmId = payload.farmId;
  }
  if (v.isPresent(payload.name)) plot.name = payload.name.trim();
  if (v.isPresent(payload.areaHa)) plot.areaHa = v.isFiniteNumber(payload.areaHa) ? payload.areaHa : null;
  if (v.isPresent(payload.geometry)) plot.geometry = v.isPlainObject(payload.geometry) ? payload.geometry : null;
  if (v.isPresent(payload.kmlFilename)) {
    plot.kmlFilename = v.isNonEmptyString(payload.kmlFilename) ? payload.kmlFilename.trim() : null;
  }
  if (v.isPresent(payload.centroidLat)) {
    plot.centroidLat = v.isFiniteNumber(payload.centroidLat) ? round7(payload.centroidLat) : null;
  }
  if (v.isPresent(payload.centroidLng)) {
    plot.centroidLng = v.isFiniteNumber(payload.centroidLng) ? round7(payload.centroidLng) : null;
  }

  await plot.save();
  return toPublicPlot(plot);
}

// DELETE (admin). O cascade remove safras/analises/eventos do talhao.
async function removePlot(plot) {
  await plot.destroy();
}

module.exports = {
  updateKml,
  getMapData,
  createPlot,
  listPlots,
  getPlot,
  updatePlot,
  removePlot,
  toPublicPlot,
};
