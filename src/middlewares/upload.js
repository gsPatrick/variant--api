const path = require('path');
const fs = require('fs');
const multer = require('multer');
const AppError = require('../utils/app-error');
const { uploadDir, maxUploadBytes } = require('../config/uploads');

// Cria um filtro de extensao reutilizavel.
function extensionFilter(allowedExt) {
  return (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExt && !allowedExt.includes(ext)) {
      return cb(new AppError(`Extensao nao suportada. Aceitos: ${allowedExt.join(', ')}.`, 400, 'UNSUPPORTED_FILE'));
    }
    return cb(null, true);
  };
}

// Upload em memoria — para arquivos que serao processados em buffer e nao
// armazenados (planilhas de solo, KML). Retorna middleware single(field).
function memoryUpload(field, { allowedExt } = {}) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxUploadBytes },
    fileFilter: extensionFilter(allowedExt),
  }).single(field);
}

// Upload de imagem em disco — para fotos de eventos da safra.
// Grava em <uploadDir>/<subdir> com nome unico; o service monta a URL.
function imageUpload(field, subdir) {
  const destination = path.join(uploadDir, subdir);
  fs.mkdirSync(destination, { recursive: true });

  const allowedExt = ['.jpg', '.jpeg', '.png', '.webp'];
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, destination),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, unique);
    },
  });

  return multer({
    storage,
    limits: { fileSize: maxUploadBytes },
    fileFilter: extensionFilter(allowedExt),
  }).single(field);
}

module.exports = { memoryUpload, imageUpload };
