const { Router } = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const { USER_ROLES } = require('../../config/constants');
const controller = require('./onboarding.controller');

const router = Router();

// Cadastro guiado e exclusivo do administrador (agronomo).
router.use(authenticate, authorize(USER_ROLES.ADMIN));

// Modo confirmacao: previa sem gravar.
router.post('/preview', controller.preview);

// Modo automatico / confirmacao final: cria tudo de forma atomica.
router.post('/', controller.create);

module.exports = router;
