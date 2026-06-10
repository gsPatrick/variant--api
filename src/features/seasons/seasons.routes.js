const { Router } = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const { resolveSeasonAccess } = require('../../middlewares/tenant-access');
const { imageUpload } = require('../../middlewares/upload');
const { USER_ROLES } = require('../../config/constants');
const controller = require('./seasons.controller');

const router = Router();

router.use(authenticate);

// ----- CRUD (controle total do admin; produtor: leitura isolada) -----
router.get('/', controller.list);
router.post('/', authorize(USER_ROLES.ADMIN), controller.create);
router.get('/:seasonId', resolveSeasonAccess, controller.getOne);
router.put('/:seasonId', authorize(USER_ROLES.ADMIN), resolveSeasonAccess, controller.update);
router.delete('/:seasonId', authorize(USER_ROLES.ADMIN), resolveSeasonAccess, controller.remove);

// ----- Timeline de eventos -----
// Listar eventos — admin ou produtor (tenant).
router.get('/:seasonId/events', resolveSeasonAccess, controller.listEvents);
// Cadastrar evento com foto (campo "foto") — apenas administrador.
router.post(
  '/:seasonId/events',
  authorize(USER_ROLES.ADMIN),
  resolveSeasonAccess,
  imageUpload('foto', 'event-photos'),
  controller.createEvent
);
// Editar evento (texto + foto opcional) — apenas administrador.
router.put(
  '/:seasonId/events/:eventId',
  authorize(USER_ROLES.ADMIN),
  resolveSeasonAccess,
  imageUpload('foto', 'event-photos'),
  controller.updateEvent
);
// Remover evento — apenas administrador.
router.delete(
  '/:seasonId/events/:eventId',
  authorize(USER_ROLES.ADMIN),
  resolveSeasonAccess,
  controller.removeEvent
);

module.exports = router;
