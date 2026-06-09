'use strict';

/**
 * Tabela season_events — eventos da linha do tempo de uma safra.
 * Indices em season_id e (season_id, event_date) para montar a timeline ordenada.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('season_events', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      season_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'seasons', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      event_type: {
        type: Sequelize.ENUM(
          'plantio',
          'adubacao',
          'aplicacao_defensivos',
          'irrigacao',
          'colheita',
          'outro'
        ),
        allowNull: false,
        defaultValue: 'outro',
      },
      title: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      event_date: {
        type: Sequelize.DATEONLY,
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

    await queryInterface.addIndex('season_events', ['season_id'], {
      name: 'season_events_season_id_idx',
    });
    await queryInterface.addIndex('season_events', ['season_id', 'event_date'], {
      name: 'season_events_season_id_event_date_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('season_events');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_season_events_event_type";');
  },
};
