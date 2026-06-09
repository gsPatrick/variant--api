'use strict';

/**
 * Tabela event_photos — fotos anexadas a um evento de safra.
 * Exibidas no pop-up de detalhamento do evento. event_id indexado.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('event_photos', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      event_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'season_events', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      url: {
        type: Sequelize.STRING(512),
        allowNull: false,
      },
      caption: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      mime_type: {
        type: Sequelize.STRING(100),
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

    await queryInterface.addIndex('event_photos', ['event_id'], {
      name: 'event_photos_event_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('event_photos');
  },
};
