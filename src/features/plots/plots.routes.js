const { Router } = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const { resolvePlotAccess } = require('../../middlewares/tenant-access');
const { memoryUpload } = require('../../middlewares/upload');
const { USER_ROLES } = require('../../config/constants');
const controller = require('./plots.controller');
const soilsRoutes = require('../soils/soils.routes');

const router = Router();

// Tudo abaixo exige autenticacao.
router.use(authenticate);

// ----- CRUD (controle total do admin; produtor: leitura isolada) -----
router.get('/', controller.list);
router.post('/', authorize(USER_ROLES.ADMIN), controller.create);
router.get('/:plotId', resolvePlotAccess, controller.getOne);
router.put('/:plotId', authorize(USER_ROLES.ADMIN), resolvePlotAccess, controller.update);
router.delete('/:plotId', authorize(USER_ROLES.ADMIN), resolvePlotAccess, controller.remove);

// ----- SAFRAS: mapa e KML -----
// Upload de KML para definir/atualizar o contorno — apenas administrador.
router.post(
  '/:plotId/kml',
  authorize(USER_ROLES.ADMIN),
  resolvePlotAccess,
  memoryUpload('arquivo', { allowedExt: ['.kml'] }),
  controller.uploadKml
);
// Dados do mapa (contorno + safra ativa) — admin ou produtor (tenant).
router.get('/:plotId/map', resolvePlotAccess, controller.mapData);

// ----- SOLOS: sub-rotas escopadas ao talhao -----
router.use('/:plotId/soil-analyses', soilsRoutes);

module.exports = router;
