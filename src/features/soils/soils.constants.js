// Mapeia o nome amigavel do nutriente (usado em ?nutriente=) para o atributo
// correspondente no model SoilAnalysis.
const NUTRIENT_FIELDS = Object.freeze({
  ph: 'ph',
  ph_cacl2: 'phCacl2',
  materia_organica: 'organicMatter',
  saturacao: 'baseSaturation',
  ctc: 'cec',
  ctc_total: 'cecTotal',
  saturacao_aluminio: 'aluminumSaturation',
  acidez_potencial: 'acidezPotencial',
  aluminio: 'aluminum',
  cot: 'totalCarbon',
  areia: 'sand',
  silte: 'silt',
  argila: 'clay',
  fosforo: 'phosphorus',
  potassio: 'potassium',
  calcio: 'calcium',
  magnesio: 'magnesium',
  enxofre: 'sulfur',
  zinco: 'zinc',
  manganes: 'manganese',
  ferro: 'iron',
  cobre: 'copper',
  boro: 'boron',
});

// Conjunto e ordem dos nutrientes/indices exibidos no grafico de radar.
const RADAR_NUTRIENTS = Object.freeze([
  'fosforo',
  'zinco',
  'manganes',
  'ferro',
  'cobre',
  'boro',
  'magnesio',
  'calcio',
  'enxofre',
  'potassio',
  'saturacao',
  'ph_cacl2',
]);

// Símbolo curto de cada nutriente do radar (usado no gráfico e nos ideais).
const RADAR_SYMBOLS = Object.freeze({
  fosforo: 'P',
  zinco: 'Zn',
  manganes: 'Mn',
  ferro: 'Fe',
  cobre: 'Cu',
  boro: 'B',
  magnesio: 'Mg',
  calcio: 'Ca',
  enxofre: 'S',
  potassio: 'K',
  saturacao: 'V',
  ph_cacl2: 'pH',
});

module.exports = {
  NUTRIENT_FIELDS,
  NUTRIENT_KEYS: Object.keys(NUTRIENT_FIELDS),
  RADAR_NUTRIENTS,
  RADAR_SYMBOLS,
};
