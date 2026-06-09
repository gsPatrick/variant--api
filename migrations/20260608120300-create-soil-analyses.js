'use strict';

/**
 * Tabela soil_analyses — analises de solo por talhao e ano (modulo SOLOS).
 * Nutrientes em DECIMAL para preservar precisao agronomica.
 * Indices em plot_id e (plot_id, year) para os graficos historico e anual.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('soil_analyses', {
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
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      analysis_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      depth: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      lab_name: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      source_file: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      // Indicadores gerais
      ph: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
      organic_matter: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      base_saturation: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      cec: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      aluminum_saturation: { type: Sequelize.DECIMAL(10, 2), allowNull: true },

      // Macronutrientes
      phosphorus: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      potassium: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      calcium: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      magnesium: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      sulfur: { type: Sequelize.DECIMAL(10, 2), allowNull: true },

      // Micronutrientes
      zinc: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      manganese: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      iron: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      copper: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      boron: { type: Sequelize.DECIMAL(10, 2), allowNull: true },

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

    await queryInterface.addIndex('soil_analyses', ['plot_id'], {
      name: 'soil_analyses_plot_id_idx',
    });
    await queryInterface.addIndex('soil_analyses', ['plot_id', 'year'], {
      name: 'soil_analyses_plot_id_year_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('soil_analyses');
  },
};
