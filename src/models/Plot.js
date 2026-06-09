// Talhao: subdivisao geografica de uma fazenda. O contorno (poligono) e
// derivado de um arquivo KML convertido para GeoJSON e armazenado em `geometry`.
// E a entidade central: análises de solo e safras se penduram no talhao.
module.exports = (sequelize, DataTypes) => {
  const Plot = sequelize.define(
    'Plot',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      farmId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'farm_id',
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      // Area do talhao em hectares.
      areaHa: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: 'area_ha',
      },
      // Contorno geografico em GeoJSON (resultado da conversao do KML).
      geometry: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      // Nome do arquivo KML original importado (rastreabilidade).
      kmlFilename: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'kml_filename',
      },
      // Centroide do talhao (lat/lng) para posicionar o mapa e marcadores.
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
      tableName: 'plots',
      underscored: true,
      timestamps: true,
    }
  );

  return Plot;
};
