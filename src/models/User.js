const { USER_ROLE_VALUES, USER_ROLES } = require('../config/constants');

// Usuario do sistema (multi-tenancy). Um usuario com role 'admin' e o
// agronomo com acesso total; role 'producer' e o cliente que ve apenas
// suas proprias fazendas. As fazendas referenciam o produtor por producer_id.
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM(...USER_ROLE_VALUES),
        allowNull: false,
        defaultValue: USER_ROLES.PRODUCER,
      },
      // Documento do produtor (CPF/CNPJ). Opcional para admin.
      document: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: 'users',
      underscored: true,
      timestamps: true,
    }
  );

  return User;
};
