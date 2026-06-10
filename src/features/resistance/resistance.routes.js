const { Router } = require('express');
const authorize = require('../../middlewares/authorize');
const { resolvePlotAccess } = require('../../middlewares/tenant-access');
const { USER_ROLES } = require('../../config/constants');
const controller = require('./resistance.controller');

// mergeParams: true para acessar :plotId do router pai (/plots/:plotId/...).
// `authenticate` ja foi aplicado no router de plots.
const router = Router({ mergeParams: true });

// Leitura — admin ou produtor (filtrado por tenant em resolvePlotAccess).
router.get('/', resolvePlotAccess, controller.list);
// Escrita — apenas administrador.
router.put('/', authorize(USER_ROLES.ADMIN), resolvePlotAccess, controller.replace);

module.exports = router;
