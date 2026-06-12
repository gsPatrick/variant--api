'use strict';

/**
 * Parâmetros extras presentes nos laudos (ex.: Riedi): acidez potencial (H+Al),
 * alumínio trocável, CTC a pH 7 (T), carbono orgânico (COT) e textura
 * (areia/silte/argila). Capturados na importação e disponíveis nos gráficos.
 */
const COLS = ['h_al', 'aluminum', 'cec_total', 'total_carbon', 'sand', 'silt', 'clay'];

module.exports = {
  async up(queryInterface, Sequelize) {
    for (const col of COLS) {
      // eslint-disable-next-line no-await-in-loop
      await queryInterface.addColumn('soil_analyses', col, {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    for (const col of COLS) {
      // eslint-disable-next-line no-await-in-loop
      await queryInterface.removeColumn('soil_analyses', col);
    }
  },
};
