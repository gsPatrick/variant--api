const { Router } = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const { USER_ROLES } = require('../../config/constants');
const controller = require('./users.controller');

const router = Router();

// Gestao de produtores — exclusiva do administrador.
router.use(authenticate, authorize(USER_ROLES.ADMIN));

router.get('/', controller.list);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
