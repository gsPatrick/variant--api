const { Router } = require('express');
const controller = require('./auth.controller');

const router = Router();

// Login emite access + refresh token.
router.post('/login', controller.login);

// Renova o access token a partir de um refresh token valido (com rotacao).
router.post('/refresh', controller.refresh);

// Revoga o refresh token informado (logout).
router.post('/logout', controller.logout);

module.exports = router;
