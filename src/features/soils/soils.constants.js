// Mapeia o nome amigavel do nutriente (usado em ?nutriente=) para o atributo
// correspondente no model SoilAnalysis.
const NUTRIENT_FIELDS = Object.freeze({
  ph: 'ph',
  ph_cacl2: 'phCacl2',
  materia_organica: 'organicMatter',
  saturacao: 'baseSaturation',
  ctc: 'cec',
  saturacao_aluminio: 'aluminumSaturation',
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

// Conjunto e ordem dos nutrientes exibidos no grafico de radar (teores do ano).
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
]);

module.exports = {
  NUTRIENT_FIELDS,
  NUTRIENT_KEYS: Object.keys(NUTRIENT_FIELDS),
  RADAR_NUTRIENTS,
};
