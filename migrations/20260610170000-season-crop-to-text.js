'use strict';

/**
 * Converte seasons.crop de ENUM('soja','milho') para VARCHAR livre, permitindo
 * qualquer cultura (algodão, sorgo, etc.). Remove o tipo enum órfão.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE "seasons" ALTER COLUMN "crop" TYPE VARCHAR(60) USING "crop"::text;'
    );
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_seasons_crop";');
  },

  async down(queryInterface) {
    // Best-effort: recria o enum (falha se houver culturas fora de soja/milho).
    await queryInterface.sequelize.query(
      "CREATE TYPE \"enum_seasons_crop\" AS ENUM('soja', 'milho');"
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE "seasons" ALTER COLUMN "crop" TYPE "enum_seasons_crop" USING "crop"::"enum_seasons_crop";'
    );
  },
};
