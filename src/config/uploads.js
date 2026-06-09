const path = require('path');

// Configuracao de upload de arquivos (planilhas, KML, fotos de eventos).
const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(process.cwd(), 'uploads');

const maxUploadMb = Number(process.env.MAX_UPLOAD_MB) || 10;

module.exports = {
  uploadDir,
  maxUploadMb,
  maxUploadBytes: maxUploadMb * 1024 * 1024,
  // Prefixo publico para montar a URL das fotos (vazio = caminho relativo).
  publicBaseUrl: process.env.APP_PUBLIC_URL || '',
};
