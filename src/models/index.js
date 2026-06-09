const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ----- Inicializacao dos models -----
// Cada arquivo exporta uma factory (sequelize, DataTypes) => Model.
const User = require('./User')(sequelize, DataTypes);
const Farm = require('./Farm')(sequelize, DataTypes);
const Plot = require('./Plot')(sequelize, DataTypes);
const SoilAnalysis = require('./SoilAnalysis')(sequelize, DataTypes);
const Season = require('./Season')(sequelize, DataTypes);
const SeasonEvent = require('./SeasonEvent')(sequelize, DataTypes);
const EventPhoto = require('./EventPhoto')(sequelize, DataTypes);
const RefreshToken = require('./RefreshToken')(sequelize, DataTypes);

// ----- Associacoes (bidirecionais e explicitas) -----

// Produtor (User) 1 --- N Fazendas
User.hasMany(Farm, {
  as: 'farms',
  foreignKey: { name: 'producerId', field: 'producer_id', allowNull: false },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Farm.belongsTo(User, {
  as: 'producer',
  foreignKey: { name: 'producerId', field: 'producer_id', allowNull: false },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// Fazenda 1 --- N Talhoes
Farm.hasMany(Plot, {
  as: 'plots',
  foreignKey: { name: 'farmId', field: 'farm_id', allowNull: false },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Plot.belongsTo(Farm, {
  as: 'farm',
  foreignKey: { name: 'farmId', field: 'farm_id', allowNull: false },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// Talhao 1 --- N Analises de solo
Plot.hasMany(SoilAnalysis, {
  as: 'soilAnalyses',
  foreignKey: { name: 'plotId', field: 'plot_id', allowNull: false },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
SoilAnalysis.belongsTo(Plot, {
  as: 'plot',
  foreignKey: { name: 'plotId', field: 'plot_id', allowNull: false },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// Talhao 1 --- N Safras
Plot.hasMany(Season, {
  as: 'seasons',
  foreignKey: { name: 'plotId', field: 'plot_id', allowNull: false },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Season.belongsTo(Plot, {
  as: 'plot',
  foreignKey: { name: 'plotId', field: 'plot_id', allowNull: false },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// Safra 1 --- N Eventos da timeline
Season.hasMany(SeasonEvent, {
  as: 'events',
  foreignKey: { name: 'seasonId', field: 'season_id', allowNull: false },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
SeasonEvent.belongsTo(Season, {
  as: 'season',
  foreignKey: { name: 'seasonId', field: 'season_id', allowNull: false },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// Evento 1 --- N Fotos
SeasonEvent.hasMany(EventPhoto, {
  as: 'photos',
  foreignKey: { name: 'eventId', field: 'event_id', allowNull: false },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
EventPhoto.belongsTo(SeasonEvent, {
  as: 'event',
  foreignKey: { name: 'eventId', field: 'event_id', allowNull: false },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// Usuario 1 --- N Refresh tokens (sessoes)
User.hasMany(RefreshToken, {
  as: 'refreshTokens',
  foreignKey: { name: 'userId', field: 'user_id', allowNull: false },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
RefreshToken.belongsTo(User, {
  as: 'user',
  foreignKey: { name: 'userId', field: 'user_id', allowNull: false },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// ----- Exportacao -----
const db = {
  sequelize,
  Sequelize: sequelize.Sequelize,
  User,
  Farm,
  Plot,
  SoilAnalysis,
  Season,
  SeasonEvent,
  EventPhoto,
  RefreshToken,
};

module.exports = db;
