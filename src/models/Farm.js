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
    },
    {
      tableName: 'farms',
      underscored: true,
      timestamps: true,
    }
  );

  return Farm;
};
