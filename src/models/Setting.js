// Configuração genérica da aplicação (key/value em JSONB).
module.exports = (sequelize, DataTypes) => {
  const Setting = sequelize.define(
    'Setting',
    {
      key: {
        type: DataTypes.STRING(80),
        primaryKey: true,
        allowNull: false,
      },
      value: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
    },
    {
      tableName: 'app_settings',
      underscored: true,
      timestamps: true,
    }
  );

  return Setting;
};
