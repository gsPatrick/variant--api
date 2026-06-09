'use strict';

/**
 * Tabela plots — talhoes de uma fazenda. geometry guarda o GeoJSON
 * convertido do KML. farm_id indexado para filtro rapido por fazenda.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('plots', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      farm_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'farms', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      area_ha: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      geometry: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      kml_filename: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      centroid_lat: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true,
      },
      centroid_lng: {
        type: Sequelize.DECIMAL(10, 7),
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

    await queryInterface.addIndex('plots', ['farm_id'], {
      name: 'plots_farm_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('plots');
  },
};
