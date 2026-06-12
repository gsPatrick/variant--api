'use strict';

/**
 * Converte season_events.event_type de ENUM para VARCHAR livre, permitindo
 * novos tipos de evento (visita, correção, manejo, etc.) sem migração.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query('ALTER TABLE "season_events" ALTER COLUMN "event_type" DROP DEFAULT;');
    await queryInterface.sequelize.query(
      'ALTER TABLE "season_events" ALTER COLUMN "event_type" TYPE VARCHAR(40) USING "event_type"::text;'
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE \"season_events\" ALTER COLUMN \"event_type\" SET DEFAULT 'outro';"
    );
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_season_events_event_type";');
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "CREATE TYPE \"enum_season_events_event_type\" AS ENUM('plantio','adubacao','aplicacao_defensivos','irrigacao','colheita','outro');"
    );
    await queryInterface.sequelize.query('ALTER TABLE "season_events" ALTER COLUMN "event_type" DROP DEFAULT;');
    await queryInterface.sequelize.query(
      'ALTER TABLE "season_events" ALTER COLUMN "event_type" TYPE "enum_season_events_event_type" USING "event_type"::"enum_season_events_event_type";'
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE \"season_events\" ALTER COLUMN \"event_type\" SET DEFAULT 'outro';"
    );
  },
};
