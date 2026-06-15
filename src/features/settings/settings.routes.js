const { Router } = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const { USER_ROLES } = require('../../config/constants');
const controller = require('./settings.controller');

const router = Router();

router.use(authenticate);

// Leitura — admin e produtor (o radar usa os ideais para calcular o nível).
router.get('/radar-ideals', controller.getRadarIdeals);
// Escrita — apenas administrador (define a referência agronômica).
router.put('/radar-ideals', authorize(USER_ROLES.ADMIN), controller.updateRadarIdeals);

// Links das redes sociais da sidebar. Leitura para todos; escrita só admin.
router.get('/social-links', controller.getSocialLinks);
router.put('/social-links', authorize(USER_ROLES.ADMIN), controller.updateSocialLinks);

module.exports = router;
