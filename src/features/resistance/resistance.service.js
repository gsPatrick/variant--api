const sequelize = require('../../config/database');
const { SoilResistance } = require('../../models');
const AppError = require('../../utils/app-error');

// Serializa uma leitura para a API (numeros, nao strings de DECIMAL).
function toDTO(row) {
  return { depthCm: row.depthCm, mpa: Number(row.mpa) };
}

// Lista as leituras de resistencia de um talhao, ordenadas por profundidade.
async function list(plot) {
  const rows = await SoilResistance.findAll({
    where: { plotId: plot.id },
    order: [['depthCm', 'ASC']],
  });
  return { plotId: plot.id, readings: rows.map(toDTO) };
}

// Valida e normaliza o payload de leituras vindo do admin.
function normalize(readings) {
  if (!Array.isArray(readings)) {
    throw new AppError('Envie "readings" como uma lista.', 400, 'INVALID_PAYLOAD');
  }
  const byDepth = new Map();
  readings.forEach((r, i) => {
    const depthCm = Number.parseInt(r?.depthCm, 10);
    const mpa = Number(r?.mpa);
    if (!Number.isInteger(depthCm) || depthCm <= 0 || depthCm > 1000) {
      throw new AppError(`Profundidade invalida na linha ${i + 1}.`, 422, 'INVALID_DEPTH');
    }
    if (!Number.isFinite(mpa) || mpa < 0 || mpa > 99) {
      throw new AppError(`Resistencia (MPa) invalida na linha ${i + 1}.`, 422, 'INVALID_MPA');
    }
    // Ultima leitura vence em caso de profundidade repetida.
    byDepth.set(depthCm, { depthCm, mpa: Math.round(mpa * 100) / 100 });
  });
  return [...byDepth.values()].sort((a, b) => a.depthCm - b.depthCm);
}

// Substitui o conjunto completo de leituras do talhao (admin). Transacional.
async function replace(plot, readings) {
  const normalized = normalize(readings);

  await sequelize.transaction(async (transaction) => {
    await SoilResistance.destroy({ where: { plotId: plot.id }, transaction });
    if (normalized.length > 0) {
      await SoilResistance.bulkCreate(
        normalized.map((r) => ({ plotId: plot.id, depthCm: r.depthCm, mpa: r.mpa })),
        { transaction }
      );
    }
  });

  return { plotId: plot.id, readings: normalized };
}

module.exports = { list, replace };
