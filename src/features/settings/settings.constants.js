// Chave da configuração e valores ideais padrão (referência agronômica) dos
// nutrientes do gráfico de radar. O agrônomo ajusta na tela de Parâmetros.
const RADAR_IDEALS_KEY = 'radar_ideals';

// Ordem/conjunto dos nutrientes/índices do radar (V = saturação de bases).
const RADAR_NUTRIENT_KEYS = ['P', 'K', 'Ca', 'Mg', 'S', 'Zn', 'Mn', 'Fe', 'Cu', 'B', 'V'];

// Valores ideais PADRÃO (genéricos) — servem só como ponto de partida.
// K em mg/dm³ (não cmolc); V = saturação de bases ideal (%).
const DEFAULT_RADAR_IDEALS = {
  P: 18,
  K: 120,
  Ca: 6,
  Mg: 2,
  S: 12,
  Zn: 2.2,
  Mn: 22,
  Fe: 50,
  Cu: 1.8,
  B: 0.6,
  V: 70,
};

module.exports = { RADAR_IDEALS_KEY, RADAR_NUTRIENT_KEYS, DEFAULT_RADAR_IDEALS };
