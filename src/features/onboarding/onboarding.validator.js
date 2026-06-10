const v = require('../../utils/validation');
const {
  ONBOARDING_MODES,
  ONBOARDING_MODE_VALUES,
  MIN_PASSWORD_LENGTH,
} = require('./onboarding.constants');

// Valida e normaliza o payload do cadastro guiado (cliente -> projeto ->
// informacoes). Funcao pura: nao acessa o banco. Retorna
// { valid, errors[], normalized }. As verificacoes que dependem do banco
// (email ja usado, cliente existente) ficam no service.

function validateCliente(cliente, errors) {
  if (!v.isPlainObject(cliente)) {
    errors.push({ field: 'cliente', message: 'cliente e obrigatorio.' });
    return null;
  }

  // Cliente existente: basta o id (UUID). Os demais campos sao ignorados.
  if (v.isNonEmptyString(cliente.id)) {
    return { isExisting: true, id: cliente.id.trim() };
  }

  // Cliente novo: nome, email e senha obrigatorios.
  if (!v.isNonEmptyString(cliente.name)) {
    errors.push({ field: 'cliente.name', message: 'nome do cliente e obrigatorio.' });
  }
  if (!v.isEmail(cliente.email)) {
    errors.push({ field: 'cliente.email', message: 'email do cliente e invalido.' });
  }
  if (!v.isNonEmptyString(cliente.password) || cliente.password.length < MIN_PASSWORD_LENGTH) {
    errors.push({
      field: 'cliente.password',
      message: `senha do cliente deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    });
  }
  if (v.isPresent(cliente.document) && !v.isNonEmptyString(cliente.document)) {
    errors.push({ field: 'cliente.document', message: 'document, se informado, deve ser texto.' });
  }
  if (v.isPresent(cliente.phone) && !v.isNonEmptyString(cliente.phone)) {
    errors.push({ field: 'cliente.phone', message: 'phone, se informado, deve ser texto.' });
  }

  return {
    isExisting: false,
    name: v.isNonEmptyString(cliente.name) ? cliente.name.trim() : undefined,
    email: v.isEmail(cliente.email) ? cliente.email.trim().toLowerCase() : undefined,
    password: cliente.password,
    document: v.isNonEmptyString(cliente.document) ? cliente.document.trim() : null,
    phone: v.isNonEmptyString(cliente.phone) ? cliente.phone.trim() : null,
  };
}

function validateProjeto(projeto, errors) {
  if (!v.isPlainObject(projeto)) {
    errors.push({ field: 'projeto', message: 'projeto (fazenda) e obrigatorio.' });
    return null;
  }

  if (!v.isNonEmptyString(projeto.name)) {
    errors.push({ field: 'projeto.name', message: 'nome do projeto/fazenda e obrigatorio.' });
  }
  if (v.isPresent(projeto.state) && (!v.isNonEmptyString(projeto.state) || projeto.state.trim().length !== 2)) {
    errors.push({ field: 'projeto.state', message: 'state deve ter 2 caracteres (UF).' });
  }
  if (v.isPresent(projeto.totalAreaHa) && !v.isFiniteNumber(projeto.totalAreaHa)) {
    errors.push({ field: 'projeto.totalAreaHa', message: 'totalAreaHa deve ser numerico.' });
  }
  if (v.isPresent(projeto.centroidLat) && !v.isFiniteNumber(projeto.centroidLat)) {
    errors.push({ field: 'projeto.centroidLat', message: 'centroidLat deve ser numerico.' });
  }
  if (v.isPresent(projeto.centroidLng) && !v.isFiniteNumber(projeto.centroidLng)) {
    errors.push({ field: 'projeto.centroidLng', message: 'centroidLng deve ser numerico.' });
  }

  return {
    name: v.isNonEmptyString(projeto.name) ? projeto.name.trim() : undefined,
    city: v.isNonEmptyString(projeto.city) ? projeto.city.trim() : null,
    state: v.isNonEmptyString(projeto.state) ? projeto.state.trim().toUpperCase() : null,
    totalAreaHa: v.isFiniteNumber(projeto.totalAreaHa) ? projeto.totalAreaHa : null,
    centroidLat: v.isFiniteNumber(projeto.centroidLat) ? projeto.centroidLat : null,
    centroidLng: v.isFiniteNumber(projeto.centroidLng) ? projeto.centroidLng : null,
  };
}

function validatePlot(plot, index, errors) {
  if (!v.isPlainObject(plot)) {
    errors.push({ field: `informacoes.plots[${index}]`, message: 'cada talhao deve ser um objeto.' });
    return null;
  }
  if (!v.isNonEmptyString(plot.name)) {
    errors.push({ field: `informacoes.plots[${index}].name`, message: 'nome do talhao e obrigatorio.' });
  }
  if (v.isPresent(plot.areaHa) && !v.isFiniteNumber(plot.areaHa)) {
    errors.push({ field: `informacoes.plots[${index}].areaHa`, message: 'areaHa deve ser numerico.' });
  }
  if (v.isPresent(plot.centroidLat) && !v.isFiniteNumber(plot.centroidLat)) {
    errors.push({ field: `informacoes.plots[${index}].centroidLat`, message: 'centroidLat deve ser numerico.' });
  }
  if (v.isPresent(plot.centroidLng) && !v.isFiniteNumber(plot.centroidLng)) {
    errors.push({ field: `informacoes.plots[${index}].centroidLng`, message: 'centroidLng deve ser numerico.' });
  }
  if (v.isPresent(plot.geometry) && !v.isPlainObject(plot.geometry)) {
    errors.push({ field: `informacoes.plots[${index}].geometry`, message: 'geometry deve ser um objeto GeoJSON.' });
  }

  return {
    name: v.isNonEmptyString(plot.name) ? plot.name.trim() : undefined,
    areaHa: v.isFiniteNumber(plot.areaHa) ? plot.areaHa : null,
    geometry: v.isPlainObject(plot.geometry) ? plot.geometry : null,
    kmlFilename: v.isNonEmptyString(plot.kmlFilename) ? plot.kmlFilename.trim() : null,
    centroidLat: v.isFiniteNumber(plot.centroidLat) ? plot.centroidLat : null,
    centroidLng: v.isFiniteNumber(plot.centroidLng) ? plot.centroidLng : null,
  };
}

function validateInformacoes(informacoes, errors) {
  // Secao opcional. Quando ausente, nenhum talhao e criado.
  if (!v.isPresent(informacoes)) {
    return { plots: [] };
  }
  if (!v.isPlainObject(informacoes)) {
    errors.push({ field: 'informacoes', message: 'informacoes, se informado, deve ser um objeto.' });
    return { plots: [] };
  }

  const rawPlots = informacoes.plots;
  if (!v.isPresent(rawPlots)) {
    return { plots: [] };
  }
  if (!v.isArray(rawPlots)) {
    errors.push({ field: 'informacoes.plots', message: 'plots deve ser uma lista.' });
    return { plots: [] };
  }

  const plots = rawPlots.map((plot, index) => validatePlot(plot, index, errors));
  return { plots };
}

function validateOnboardingPayload(payload) {
  const errors = [];

  if (!v.isPlainObject(payload)) {
    return {
      valid: false,
      errors: [{ field: 'body', message: 'corpo da requisicao invalido.' }],
      normalized: null,
    };
  }

  const mode = v.isPresent(payload.mode) ? payload.mode : ONBOARDING_MODES.CONFIRMATION;
  if (!ONBOARDING_MODE_VALUES.includes(mode)) {
    errors.push({
      field: 'mode',
      message: `mode deve ser um de: ${ONBOARDING_MODE_VALUES.join(', ')}.`,
    });
  }

  const cliente = validateCliente(payload.cliente, errors);
  const projeto = validateProjeto(payload.projeto, errors);
  const informacoes = validateInformacoes(payload.informacoes, errors);

  if (errors.length > 0) {
    return { valid: false, errors, normalized: null };
  }

  return {
    valid: true,
    errors: [],
    normalized: { mode, cliente, projeto, informacoes },
  };
}

module.exports = { validateOnboardingPayload };
