'use strict';

/**
 * Tabela seasons — safras por talhao (modulo SAFRAS).
 * Indices em plot_id e (plot_id, year) para listar safras de um talhao.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('seasons', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      plot_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'plots', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      crop: {
        type: Sequelize.ENUM('soja', 'milho'),
        allowNull: false,
      },
      variety: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      season_label: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      marker_lat: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true,
      },
      marker_lng: {
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

    await queryInterface.addIndex('seasons', ['plot_id'], {
      name: 'seasons_plot_id_idx',
    });
    await queryInterface.addIndex('seasons', ['plot_id', 'year'], {
      name: 'seasons_plot_id_year_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('seasons');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_seasons_crop";');
  },
};
