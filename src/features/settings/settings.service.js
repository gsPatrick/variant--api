const { Setting } = require('../../models');
const v = require('../../utils/validation');
const { RADAR_IDEALS_KEY, RADAR_NUTRIENT_KEYS, DEFAULT_RADAR_IDEALS } = require('./settings.constants');

// Lê os ideais salvos e mescla sobre os padrões (garante os 10 nutrientes).
async function getRadarIdeals() {
  const row = await Setting.findByPk(RADAR_IDEALS_KEY);
  const stored = row && v.isPlainObject(row.value) ? row.value : {};
  const ideals = {};
  RADAR_NUTRIENT_KEYS.forEach((k) => {
    ideals[k] = v.isFiniteNumber(stored[k]) ? Number(stored[k]) : DEFAULT_RADAR_IDEALS[k];
  });
  return { ideals };
}

// Salva os ideais (admin). Aceita apenas os nutrientes conhecidos e números > 0.
async function saveRadarIdeals(payload) {
  const incoming = v.isPlainObject(payload) ? payload : {};
  const errors = [];
  const ideals = {};

  RADAR_NUTRIENT_KEYS.forEach((k) => {
    const raw = incoming[k];
    if (raw === undefined || raw === null || raw === '') {
      // Mantém o padrão quando não informado.
      ideals[k] = DEFAULT_RADAR_IDEALS[k];
      return;
    }
    const num = Number(raw);
    if (!Number.isFinite(num) || num <= 0) {
      errors.push({ field: k, message: `${k}: informe um número maior que zero.` });
      return;
    }
    ideals[k] = Math.round(num * 1000) / 1000;
  });

  if (errors.length > 0) throw v.validationError(errors);

  await Setting.upsert({ key: RADAR_IDEALS_KEY, value: ideals });
  return { ideals };
}

module.exports = { getRadarIdeals, saveRadarIdeals };
