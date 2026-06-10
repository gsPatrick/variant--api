// Fazenda pertencente a um produtor (User com role 'producer').
// Agrupa talhoes. O acesso do produtor parte daqui: ele so enxerga
// fazendas onde producer_id == seu proprio id.
module.exports = (sequelize, DataTypes) => {
  const Farm = sequelize.define(
    'Farm',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      producerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'producer_id',
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
      state: {
        type: DataTypes.STRING(2),
        allowNull: true,
      },
      // Area total da fazenda em hectares.
      totalAreaHa: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: 'total_area_ha',
      },
      // Centroide (lat/lng) da fazenda — geocodificado de cidade/UF no cadastro.
      // Centraliza o mapa na regiao antes do contorno do talhao existir.
      centroidLat: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
        field: 'centroid_lat',
      },
      centroidLng: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
        field: 'centroid_lng',
      },
    },
    {
      tableName: 'farms',
      underscored: true,
      timestamps: true,
    }
  );

  return Farm;
};
