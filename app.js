require('dotenv').config();

const express = require('express');
const cors = require('cors');

const sequelize = require('./src/config/database');
const errorHandler = require('./src/middlewares/error-handler');
const { uploadDir } = require('./src/config/uploads');

const app = express();

// ----- Middlewares globais -----
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Arquivos enviados (fotos de eventos) servidos estaticamente em /uploads.
app.use('/uploads', express.static(uploadDir));

const API_PREFIX = process.env.APP_API_PREFIX || '/api/v1';

// ----- Health / probes (unicos endpoints fora de features) -----
// Usados por orquestracao e load balancers para readiness/liveness.
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'variant-api' });
});

// ----- Rotas versionadas das features -----
// src/routes/index.js e o unico agregador das rotas da versao atual.
app.use(API_PREFIX, require('./src/routes'));

// ----- Handler de erro global (sempre por ultimo) -----
app.use(errorHandler);

const PORT = Number(process.env.APP_PORT) || 3000;

async function start() {
  try {
    // Falha cedo se o banco nao estiver acessivel na subida da aplicacao.
    await sequelize.authenticate();
    console.log('[db] conexao estabelecida com sucesso.');

    app.listen(PORT, () => {
      console.log(`[http] variant-api ouvindo na porta ${PORT} (prefixo ${API_PREFIX})`);
    });
  } catch (error) {
    console.error('[startup] falha ao iniciar a aplicacao:', error);
    process.exit(1);
  }
}

start();

module.exports = app;
