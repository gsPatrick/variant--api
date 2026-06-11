const { Router } = require('express');
const authenticate = require('../../middlewares/authenticate');
const controller = require('./auth.controller');

const router = Router();

// Login emite access + refresh token.
router.post('/login', controller.login);

// Perfil do próprio usuário (autenticado).
router.get('/me', authenticate, controller.me);
router.patch('/me', authenticate, controller.updateMe);

// Renova o access token a partir de um refresh token valido (com rotacao).
router.post('/refresh', controller.refresh);

// Revoga o refresh token informado (logout).
router.post('/logout', controller.logout);

module.exports = router;
