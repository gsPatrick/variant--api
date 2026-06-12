// Constantes de dominio compartilhadas entre models e (futuramente) services.
// Centralizadas aqui para evitar literais de string espalhados pelo codigo.

// Papeis de acesso (multi-tenancy). Admin = agronomo; producer = cliente.
const USER_ROLES = Object.freeze({
  ADMIN: 'admin',
  PRODUCER: 'producer',
});

// Culturas suportadas no modulo SAFRAS.
const CROPS = Object.freeze({
  SOYBEAN: 'soja',
  CORN: 'milho',
});

// Tipos de evento da linha do tempo da safra.
const SEASON_EVENT_TYPES = Object.freeze({
  PLANTING: 'plantio',
  FERTILIZATION: 'adubacao',
  PESTICIDE_APPLICATION: 'aplicacao_defensivos',
  IRRIGATION: 'irrigacao',
  HARVEST: 'colheita',
  VISIT: 'visita',
  CORRECTION: 'correcao',
  MANAGEMENT: 'manejo',
  OTHER: 'outro',
});

module.exports = {
  USER_ROLES,
  CROPS,
  SEASON_EVENT_TYPES,
  USER_ROLE_VALUES: Object.values(USER_ROLES),
  CROP_VALUES: Object.values(CROPS),
  SEASON_EVENT_TYPE_VALUES: Object.values(SEASON_EVENT_TYPES),
};
