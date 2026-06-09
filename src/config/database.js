const { Sequelize } = require('sequelize');

// Instancia unica do Sequelize usada em tempo de execucao pela aplicacao.
// As migrations usam config/config.js (sequelize-cli); ambos leem as
// mesmas variaveis de ambiente para manter consistencia.
const useSsl = String(process.env.DB_SSL).toLowerCase() === 'true';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: String(process.env.DB_LOGGING).toLowerCase() === 'true' ? console.log : false,
    define: {
      // Mapeia atributos camelCase dos models para colunas snake_case no banco
      // e cria automaticamente created_at / updated_at.
      underscored: true,
      timestamps: true,
    },
    dialectOptions: useSsl
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;
