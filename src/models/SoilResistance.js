// Resistencia do solo a penetracao (compactacao) de um talhao, por profundidade.
// Cada linha = uma leitura de penetrometro a uma profundidade (cm), em MPa.
// O conjunto de leituras de um talhao alimenta o "heat" de compactacao no mapa.
module.exports = (sequelize, DataTypes) => {
  const SoilResistance = sequelize.define(
    'SoilResistance',
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
      // Profundidade da leitura, em centimetros (ex.: 10, 20, 30...).
      depthCm: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'depth_cm',
      },
      // Resistencia a penetracao, em MPa.
      mpa: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
    },
    {
      tableName: 'soil_resistance',
      underscored: true,
      timestamps: true,
    }
  );

  return SoilResistance;
};
