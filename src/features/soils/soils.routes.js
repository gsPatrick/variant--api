const { Router } = require('express');
const authorize = require('../../middlewares/authorize');
const { resolvePlotAccess } = require('../../middlewares/tenant-access');
const { memoryUpload } = require('../../middlewares/upload');
const { USER_ROLES } = require('../../config/constants');
const controller = require('./soils.controller');

// mergeParams: true para acessar :plotId do router pai (/plots/:plotId/...).
// `authenticate` ja foi aplicado no router de plots.
const router = Router({ mergeParams: true });

// Importacao de planilha — apenas administrador.
router.post(
  '/import',
  authorize(USER_ROLES.ADMIN),
  resolvePlotAccess,
  memoryUpload('arquivo', { allowedExt: ['.xlsx', '.xls', '.csv'] }),
  controller.importAnalyses
);

// Leituras — admin ou produtor (filtrado por tenant em resolvePlotAccess).
router.get('/', resolvePlotAccess, controller.list);
router.get('/depths', resolvePlotAccess, controller.depths);
router.get('/evolution', resolvePlotAccess, controller.evolution);
router.get('/radar', resolvePlotAccess, controller.radar);
// Exclui uma análise específica — apenas administrador.
router.delete('/:analysisId', authorize(USER_ROLES.ADMIN), resolvePlotAccess, controller.remove);

module.exports = router;
