const { SEASON_EVENT_TYPE_VALUES, SEASON_EVENT_TYPES } = require('../config/constants');

// Evento da linha do tempo de uma safra (plantio, adubacao, defensivos,
// colheita, etc.). Exibido cronologicamente na timeline; ao clicar, abre
// pop-up com a descricao e as fotos anexadas (EventPhoto).
module.exports = (sequelize, DataTypes) => {
  const SeasonEvent = sequelize.define(
    'SeasonEvent',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      seasonId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'season_id',
      },
      // Categoria do evento (define icone/cor na timeline).
      eventType: {
        type: DataTypes.ENUM(...SEASON_EVENT_TYPE_VALUES),
        allowNull: false,
        defaultValue: SEASON_EVENT_TYPES.OTHER,
        field: 'event_type',
      },
      title: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Data em que o evento ocorreu (ordenacao da timeline).
      eventDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'event_date',
      },
    },
    {
      tableName: 'season_events',
      underscored: true,
      timestamps: true,
    }
  );

  return SeasonEvent;
};
