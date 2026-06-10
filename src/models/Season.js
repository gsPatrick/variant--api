// Safra de um talhao (modulo SAFRAS): cultura + variedade plantada em um ciclo.
// Alimenta o marcador no mapa (cultura/variedade) e agrupa os eventos da timeline.
module.exports = (sequelize, DataTypes) => {
  const Season = sequelize.define(
    'Season',
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
      // Cultura plantada (texto livre: soja, milho, algodão, etc.).
      crop: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      // Nome comercial da variedade (ex.: "Ares 7200", "Fielder RR").
      variety: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      // Rotulo do ciclo agricola (ex.: "2023/2024").
      seasonLabel: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'season_label',
      },
      // Ano de referencia da safra (para ordenacao/filtro rapido).
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'start_date',
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'end_date',
      },
      // Posicao do marcador da safra no mapa. Quando ausente, usar o
      // centroide do talhao como fallback no front-end.
      markerLat: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
        field: 'marker_lat',
      },
      markerLng: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
        field: 'marker_lng',
      },
    },
    {
      tableName: 'seasons',
      underscored: true,
      timestamps: true,
    }
  );

  return Season;
};
