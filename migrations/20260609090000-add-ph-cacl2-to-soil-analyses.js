'use strict';

/**
 * Adiciona a coluna ph_cacl2 em soil_analyses para armazenar o pH em CaCl2
 * separadamente do pH em agua (coluna `ph`). Alguns laudos trazem ambas.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('soil_analyses', 'ph_cacl2', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('soil_analyses', 'ph_cacl2');
  },
};
