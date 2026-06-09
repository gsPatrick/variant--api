const { Router } = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const { resolveFarmAccess } = require('../../middlewares/tenant-access');
const { USER_ROLES } = require('../../config/constants');
const controller = require('./farms.controller');

const router = Router();

router.use(authenticate);

// Leituras: admin (global) ou produtor (apenas as proprias fazendas).
router.get('/', controller.list);
router.get('/:farmId', resolveFarmAccess, controller.getOne);

// Escrita: exclusiva do administrador (produtor recebe 403).
router.post('/', authorize(USER_ROLES.ADMIN), controller.create);
router.put('/:farmId', authorize(USER_ROLES.ADMIN), resolveFarmAccess, controller.update);
router.delete('/:farmId', authorize(USER_ROLES.ADMIN), resolveFarmAccess, controller.remove);

module.exports = router;
