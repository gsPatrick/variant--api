const { Setting } = require('../../models');
const v = require('../../utils/validation');
const {
  RADAR_IDEALS_KEY,
  RADAR_NUTRIENT_KEYS,
  DEFAULT_RADAR_IDEALS,
  SOCIAL_LINKS_KEY,
  SOCIAL_LINK_KEYS,
  DEFAULT_SOCIAL_LINKS,
} = require('./settings.constants');

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

// --- Links das redes sociais (sidebar) ---

// Lê os links salvos; quando não há registro ainda, usa os padrões.
async function getSocialLinks() {
  const row = await Setting.findByPk(SOCIAL_LINKS_KEY);
  const stored = row && v.isPlainObject(row.value) ? row.value : null;
  const links = {};
  SOCIAL_LINK_KEYS.forEach((k) => {
    if (stored) {
      links[k] = typeof stored[k] === 'string' ? stored[k].trim() : '';
    } else {
      links[k] = DEFAULT_SOCIAL_LINKS[k] || '';
    }
  });
  return { links };
}

// Salva os links (admin). Aceita strings (URL) ou vazio para esconder o ícone.
async function saveSocialLinks(payload) {
  const incoming = v.isPlainObject(payload) ? payload : {};
  const errors = [];
  const links = {};

  SOCIAL_LINK_KEYS.forEach((k) => {
    const raw = incoming[k];
    if (raw === undefined || raw === null || String(raw).trim() === '') {
      links[k] = '';
      return;
    }
    const url = String(raw).trim();
    if (!/^https?:\/\/.+/i.test(url)) {
      errors.push({ field: k, message: `${k}: informe uma URL completa (começando com http:// ou https://).` });
      return;
    }
    links[k] = url;
  });

  if (errors.length > 0) throw v.validationError(errors);

  await Setting.upsert({ key: SOCIAL_LINKS_KEY, value: links });
  return { links };
}

module.exports = { getRadarIdeals, saveRadarIdeals, getSocialLinks, saveSocialLinks };
