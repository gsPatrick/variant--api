const sequelize = require('../../config/database');
const { Season, Plot, Farm, SeasonEvent, EventPhoto } = require('../../models');
const AppError = require('../../utils/app-error');
const v = require('../../utils/validation');
const {
  USER_ROLES,
  CROP_VALUES,
  SEASON_EVENT_TYPES,
  SEASON_EVENT_TYPE_VALUES,
} = require('../../config/constants');
const { publicBaseUrl } = require('../../config/uploads');

// Monta a URL publica da foto a partir do nome de arquivo gravado.
function buildPhotoUrl(filename) {
  return `${publicBaseUrl}/uploads/event-photos/${filename}`;
}

function formatPhoto(photo) {
  return {
    id: photo.id,
    url: photo.url,
    caption: photo.caption,
    fileName: photo.fileName,
    mimeType: photo.mimeType,
  };
}

function formatEvent(event, photos) {
  return {
    id: event.id,
    eventType: event.eventType,
    title: event.title,
    description: event.description,
    eventDate: event.eventDate,
    photos: (photos || []).map(formatPhoto),
  };
}

// Lista os eventos da safra ordenados cronologicamente (timeline), com fotos.
async function listEvents(season) {
  const events = await SeasonEvent.findAll({
    where: { seasonId: season.id },
    order: [
      ['event_date', 'ASC'],
      ['created_at', 'ASC'],
    ],
    include: [{ model: EventPhoto, as: 'photos' }],
  });

  return events.map((event) => formatEvent(event, event.photos));
}

// Valida o payload do evento. Datas no formato YYYY-MM-DD.
function validateEventPayload(payload) {
  const errors = [];

  if (!v.isNonEmptyString(payload.title)) {
    errors.push({ field: 'title', message: 'titulo e obrigatorio.' });
  }
  if (!v.isNonEmptyString(payload.eventDate) || Number.isNaN(Date.parse(payload.eventDate))) {
    errors.push({ field: 'eventDate', message: 'eventDate (YYYY-MM-DD) e obrigatorio e valido.' });
  }

  const eventType = v.isNonEmptyString(payload.eventType)
    ? payload.eventType.trim()
    : SEASON_EVENT_TYPES.OTHER;
  if (!SEASON_EVENT_TYPE_VALUES.includes(eventType)) {
    errors.push({
      field: 'eventType',
      message: `eventType invalido. Use: ${SEASON_EVENT_TYPE_VALUES.join(', ')}.`,
    });
  }

  return { errors, eventType };
}

// Cadastra um evento na linha do tempo, anexando a foto (opcional) em transacao.
async function createEvent(season, payload, file) {
  const { errors, eventType } = validateEventPayload(payload);
  if (errors.length > 0) {
    const error = new AppError('Dados do evento invalidos.', 400, 'VALIDATION_ERROR');
    error.details = errors;
    throw error;
  }

  return sequelize.transaction(async (transaction) => {
    const event = await SeasonEvent.create(
      {
        seasonId: season.id,
        eventType,
        title: payload.title.trim(),
        description: v.isNonEmptyString(payload.description) ? payload.description.trim() : null,
        eventDate: payload.eventDate,
      },
      { transaction }
    );

    const photos = [];
    if (file) {
      const photo = await EventPhoto.create(
        {
          eventId: event.id,
          url: buildPhotoUrl(file.filename),
          caption: v.isNonEmptyString(payload.caption) ? payload.caption.trim() : null,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
        },
        { transaction }
      );
      photos.push(photo);
    }

    return formatEvent(event, photos);
  });
}

// Carrega um evento garantindo que pertence à safra (tenant já validado).
async function findOwnedEvent(season, eventId) {
  const event = await SeasonEvent.findByPk(eventId, { include: [{ model: EventPhoto, as: 'photos' }] });
  if (!event || event.seasonId !== season.id) {
    throw new AppError('Evento nao encontrado.', 404, 'EVENT_NOT_FOUND');
  }
  return event;
}

// UPDATE de evento (admin): campos de texto + foto opcional (anexa nova).
async function updateEvent(season, eventId, payload, file) {
  const event = await findOwnedEvent(season, eventId);

  const errors = [];
  if (v.isPresent(payload.title) && !v.isNonEmptyString(payload.title)) {
    errors.push({ field: 'title', message: 'titulo invalido.' });
  }
  if (
    v.isPresent(payload.eventDate) &&
    (!v.isNonEmptyString(payload.eventDate) || Number.isNaN(Date.parse(payload.eventDate)))
  ) {
    errors.push({ field: 'eventDate', message: 'eventDate (YYYY-MM-DD) invalido.' });
  }
  let eventType;
  if (v.isPresent(payload.eventType)) {
    eventType = String(payload.eventType).trim();
    if (!SEASON_EVENT_TYPE_VALUES.includes(eventType)) {
      errors.push({ field: 'eventType', message: `eventType invalido. Use: ${SEASON_EVENT_TYPE_VALUES.join(', ')}.` });
    }
  }
  if (errors.length > 0) throw v.validationError(errors);

  return sequelize.transaction(async (transaction) => {
    if (v.isPresent(payload.title)) event.title = payload.title.trim();
    if (eventType) event.eventType = eventType;
    if (v.isPresent(payload.eventDate)) event.eventDate = payload.eventDate;
    if (v.isPresent(payload.description)) {
      event.description = v.isNonEmptyString(payload.description) ? payload.description.trim() : null;
    }
    await event.save({ transaction });

    if (file) {
      await EventPhoto.create(
        {
          eventId: event.id,
          url: buildPhotoUrl(file.filename),
          caption: null,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
        },
        { transaction }
      );
    }

    const photos = await EventPhoto.findAll({ where: { eventId: event.id }, transaction });
    return formatEvent(event, photos);
  });
}

// DELETE de evento (admin). O cascade remove as fotos associadas.
async function removeEvent(season, eventId) {
  const event = await findOwnedEvent(season, eventId);
  await event.destroy();
}

// ----- CRUD de safras (controle total do admin; produtor: leitura isolada) -----

function toPublicSeason(season) {
  return {
    id: season.id,
    plotId: season.plotId,
    crop: season.crop,
    variety: season.variety,
    seasonLabel: season.seasonLabel,
    year: season.year,
    startDate: season.startDate,
    endDate: season.endDate,
    marker: { lat: season.markerLat, lng: season.markerLng },
    createdAt: season.createdAt,
    updatedAt: season.updatedAt,
  };
}

function validateSeason(payload, { partial }) {
  const errors = [];
  if (!partial || v.isPresent(payload.crop)) {
    if (!v.isNonEmptyString(payload.crop) || !CROP_VALUES.includes(payload.crop)) {
      errors.push({ field: 'crop', message: `crop deve ser um de: ${CROP_VALUES.join(', ')}.` });
    }
  }
  if (!partial || v.isPresent(payload.variety)) {
    if (!v.isNonEmptyString(payload.variety)) {
      errors.push({ field: 'variety', message: 'variety e obrigatorio.' });
    }
  }
  if (!partial || v.isPresent(payload.year)) {
    if (!Number.isInteger(payload.year)) {
      errors.push({ field: 'year', message: 'year e obrigatorio e deve ser inteiro.' });
    }
  }
  if (v.isPresent(payload.markerLat) && !v.isFiniteNumber(payload.markerLat)) {
    errors.push({ field: 'markerLat', message: 'markerLat deve ser numerico.' });
  }
  if (v.isPresent(payload.markerLng) && !v.isFiniteNumber(payload.markerLng)) {
    errors.push({ field: 'markerLng', message: 'markerLng deve ser numerico.' });
  }
  return errors;
}

async function assertPlotExists(plotId) {
  if (!v.isNonEmptyString(plotId)) {
    throw v.validationError([{ field: 'plotId', message: 'plotId e obrigatorio.' }]);
  }
  const plot = await Plot.findByPk(plotId);
  if (!plot) {
    throw new AppError('Talhao informado nao existe.', 404, 'PLOT_NOT_FOUND');
  }
  return plot;
}

// CREATE (admin).
async function createSeason(payload) {
  const errors = validateSeason(payload, { partial: false });
  if (errors.length > 0) throw v.validationError(errors);
  await assertPlotExists(payload.plotId);

  const season = await Season.create({
    plotId: payload.plotId,
    crop: payload.crop,
    variety: payload.variety.trim(),
    seasonLabel: v.isNonEmptyString(payload.seasonLabel) ? payload.seasonLabel.trim() : null,
    year: payload.year,
    startDate: v.isNonEmptyString(payload.startDate) ? payload.startDate : null,
    endDate: v.isNonEmptyString(payload.endDate) ? payload.endDate : null,
    markerLat: v.isFiniteNumber(payload.markerLat) ? payload.markerLat : null,
    markerLng: v.isFiniteNumber(payload.markerLng) ? payload.markerLng : null,
  });
  return toPublicSeason(season);
}

// LIST. Produtor: apenas safras de talhoes das suas fazendas. Admin: todas
// (filtro opcional ?plotId).
async function listSeasons(user, query) {
  const where = {};
  if (v.isNonEmptyString(query.plotId)) {
    where.plotId = query.plotId;
  }

  const include =
    user.role === USER_ROLES.PRODUCER
      ? [
          {
            model: Plot,
            as: 'plot',
            attributes: [],
            required: true,
            include: [{ model: Farm, as: 'farm', attributes: [], where: { producerId: user.id } }],
          },
        ]
      : [];

  const seasons = await Season.findAll({
    where,
    include,
    order: [
      ['year', 'DESC'],
      ['created_at', 'DESC'],
    ],
  });
  return seasons.map(toPublicSeason);
}

// READ ONE (season ja carregada/tenant-checada pelo middleware).
function getSeason(season) {
  return toPublicSeason(season);
}

// UPDATE (admin).
async function updateSeason(season, payload) {
  const errors = validateSeason(payload, { partial: true });
  if (errors.length > 0) throw v.validationError(errors);

  if (v.isPresent(payload.plotId)) {
    await assertPlotExists(payload.plotId);
    season.plotId = payload.plotId;
  }
  if (v.isPresent(payload.crop)) season.crop = payload.crop;
  if (v.isPresent(payload.variety)) season.variety = payload.variety.trim();
  if (v.isPresent(payload.seasonLabel)) {
    season.seasonLabel = v.isNonEmptyString(payload.seasonLabel) ? payload.seasonLabel.trim() : null;
  }
  if (v.isPresent(payload.year)) season.year = payload.year;
  if (v.isPresent(payload.startDate)) season.startDate = v.isNonEmptyString(payload.startDate) ? payload.startDate : null;
  if (v.isPresent(payload.endDate)) season.endDate = v.isNonEmptyString(payload.endDate) ? payload.endDate : null;
  if (v.isPresent(payload.markerLat)) season.markerLat = v.isFiniteNumber(payload.markerLat) ? payload.markerLat : null;
  if (v.isPresent(payload.markerLng)) season.markerLng = v.isFiniteNumber(payload.markerLng) ? payload.markerLng : null;

  await season.save();
  return toPublicSeason(season);
}

// DELETE (admin). O cascade remove eventos/fotos da safra.
async function removeSeason(season) {
  await season.destroy();
}

module.exports = {
  listEvents,
  createEvent,
  updateEvent,
  removeEvent,
  createSeason,
  listSeasons,
  getSeason,
  updateSeason,
  removeSeason,
  toPublicSeason,
};
