// Chave da configuração e valores ideais padrão (referência agronômica) dos
// nutrientes do gráfico de radar. O agrônomo ajusta na tela de Parâmetros.
const RADAR_IDEALS_KEY = 'radar_ideals';

// Ordem/conjunto dos nutrientes do radar.
const RADAR_NUTRIENT_KEYS = ['P', 'K', 'Ca', 'Mg', 'S', 'Zn', 'Mn', 'Fe', 'Cu', 'B'];

// Valores ideais PADRÃO (genéricos) — servem só como ponto de partida.
const DEFAULT_RADAR_IDEALS = {
  P: 18,
  K: 0.45,
  Ca: 6,
  Mg: 2,
  S: 12,
  Zn: 2.2,
  Mn: 22,
  Fe: 50,
  Cu: 1.8,
  B: 0.6,
};

module.exports = { RADAR_IDEALS_KEY, RADAR_NUTRIENT_KEYS, DEFAULT_RADAR_IDEALS };
