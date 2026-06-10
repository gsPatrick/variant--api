'use strict';

/**
 * Adiciona o centroide (lat/lng) da fazenda — derivado da geocodificacao de
 * cidade/UF no cadastro. Usado para centralizar o mapa na regiao da fazenda
 * antes do contorno do talhao ser desenhado.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('farms', 'centroid_lat', {
      type: Sequelize.DECIMAL(10, 7),
      allowNull: true,
    });
    await queryInterface.addColumn('farms', 'centroid_lng', {
      type: Sequelize.DECIMAL(10, 7),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('farms', 'centroid_lat');
    await queryInterface.removeColumn('farms', 'centroid_lng');
  },
};
