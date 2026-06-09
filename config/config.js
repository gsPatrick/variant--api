require('dotenv').config();

// Configuracao consumida pelo sequelize-cli (migrations/seeders).
// Reaproveita as mesmas variaveis de ambiente usadas pela aplicacao
// (src/config/database.js) para evitar divergencia entre CLI e runtime.
const useSsl = String(process.env.DB_SSL).toLowerCase() === 'true';

const baseConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
  logging: String(process.env.DB_LOGGING).toLowerCase() === 'true' ? console.log : false,
  define: {
    underscored: true,
    timestamps: true,
  },
  dialectOptions: useSsl
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
};

module.exports = {
  development: baseConfig,
  test: baseConfig,
  production: baseConfig,
};
