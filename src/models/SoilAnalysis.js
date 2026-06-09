// Analise de solo de um talhao em um determinado ano (modulo SOLOS).
// Armazena todos os nutrientes necessarios para os dois graficos:
//  - barras (evolucao historica por ano): Ca, Mg, K, P, S, materia organica, saturacao;
//  - radar/spider (teores de um ano): P, Zn, Mn, Fe, Cu, B, Mg, Ca, S, K.
// Valores em DECIMAL para preservar a precisao exigida pelos dados agronomicos.
module.exports = (sequelize, DataTypes) => {
  const SoilAnalysis = sequelize.define(
    'SoilAnalysis',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      plotId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'plot_id',
      },
      // Ano de referencia da analise (eixo do grafico de barras historico).
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // Data exata da coleta/analise, quando disponivel.
      analysisDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'analysis_date',
      },
      // Profundidade da amostra (ex.: "0-20cm").
      depth: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      labName: {
        type: DataTypes.STRING(150),
        allowNull: true,
        field: 'lab_name',
      },
      // Arquivo (planilha) de origem da importacao em lote.
      sourceFile: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'source_file',
      },

      // ----- Indicadores gerais -----
      // pH em agua (padrao). Mantido como `ph` por compatibilidade.
      ph: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      // pH em CaCl2 (quando o laudo trouxer as duas leituras).
      phCacl2: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: 'ph_cacl2',
      },
      organicMatter: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'organic_matter',
      },
      // Saturacao por bases (V%).
      baseSaturation: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'base_saturation',
      },
      // Capacidade de troca cationica (CTC).
      cec: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      // Saturacao por aluminio (m%).
      aluminumSaturation: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'aluminum_saturation',
      },

      // ----- Macronutrientes -----
      phosphorus: { // P
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      potassium: { // K
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      calcium: { // Ca
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      magnesium: { // Mg
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      sulfur: { // S
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },

      // ----- Micronutrientes -----
      zinc: { // Zn
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      manganese: { // Mn
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      iron: { // Fe
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      copper: { // Cu
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      boron: { // B
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
    },
    {
      tableName: 'soil_analyses',
      underscored: true,
      timestamps: true,
    }
  );

  return SoilAnalysis;
};
