'use strict';

/**
 * Tabela farms — fazendas pertencentes a um produtor (users.id).
 * producer_id indexado para filtro rapido das fazendas de um produtor.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('farms', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      producer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING(120),
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING(2),
        allowNull: true,
      },
      total_area_ha: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
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

    await queryInterface.addIndex('farms', ['producer_id'], {
      name: 'farms_producer_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('farms');
  },
};
