'use strict';

/**
 * Tabela genérica de configurações da aplicação (key/value em JSONB).
 * Usada, por ex., para os valores ideais de referência dos nutrientes
 * (gráfico de radar), definidos pelo agrônomo.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('app_settings', {
      key: {
        type: Sequelize.STRING(80),
        primaryKey: true,
        allowNull: false,
      },
      value: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('app_settings');
  },
};
