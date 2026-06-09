const { Router } = require('express');

const authRoutes = require('../features/auth/auth.routes');
const onboardingRoutes = require('../features/onboarding/onboarding.routes');
const farmsRoutes = require('../features/farms/farms.routes');
const plotsRoutes = require('../features/plots/plots.routes');
const seasonsRoutes = require('../features/seasons/seasons.routes');

// Unico agregador das rotas da versao atual da API. Cada feature expoe seu
// proprio router; nada de endpoints "soltos" aqui, exceto health/ping.
const router = Router();

// Probe versionado (complementa o /health nao versionado do app.js).
router.get('/ping', (req, res) => {
  res.status(200).json({ pong: true });
});

router.use('/auth', authRoutes);
router.use('/onboarding', onboardingRoutes);
// CRUD de dominio + modulos SOLOS (sob /plots/:plotId/soil-analyses) e SAFRAS.
router.use('/farms', farmsRoutes);
router.use('/plots', plotsRoutes);
router.use('/seasons', seasonsRoutes);

module.exports = router;
