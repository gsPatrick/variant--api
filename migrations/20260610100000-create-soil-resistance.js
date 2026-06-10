'use strict';

/**
 * Tabela soil_resistance — resistencia do solo a penetracao (compactacao)
 * por talhao e profundidade. Uma leitura por (talhao, profundidade_cm).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('soil_resistance', {
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
      depth_cm: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      mpa: {
        type: Sequelize.DECIMAL(5, 2),
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

    // Uma leitura por profundidade dentro de cada talhao.
    await queryInterface.addIndex('soil_resistance', ['plot_id', 'depth_cm'], {
      name: 'soil_resistance_plot_id_depth_cm_uq',
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('soil_resistance');
  },
};
