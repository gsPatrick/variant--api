const XLSX = require('xlsx');

// Le uma planilha (xlsx/xls/csv) de analises de solo a partir de um buffer e
// devolve { rows, errors }. Suporta tanto um layout simples (1 cabecalho, 1
// talhao) quanto o layout de laudo de laboratorio (2 linhas de cabecalho com
// unidades, varios talhoes no mesmo arquivo com celulas de Talhao/Ano mescladas
// e profundidades 20/40). Cada row sai normalizada para os atributos do model.

// Atributo do model -> cabecalhos aceitos (ja normalizados).
const NUTRIENT_HEADER_MAP = {
  ph: ['ph', 'ph_em_agua', 'ph_agua', 'ph_h2o'],
  phCacl2: ['ph_cacl2', 'ph_cacl_2', 'ph_caclâ‚‚', 'ph_ca'],
  organicMatter: ['materia_organica', 'mo', 'm_o'],
  baseSaturation: ['saturacao', 'saturacao_por_bases', 'v'],
  cec: ['ctc', 'cec', 'ctc_efetiva'],
  aluminumSaturation: ['saturacao_aluminio', 'saturacao_por_aluminio', 'm'],
  phosphorus: ['fosforo', 'p'],
  potassium: ['potassio', 'k'],
  calcium: ['calcio', 'ca'],
  magnesium: ['magnesio', 'mg'],
  sulfur: ['enxofre', 's'],
  zinc: ['zinco', 'zn'],
  manganese: ['manganes', 'mn'],
  iron: ['ferro', 'fe'],
  copper: ['cobre', 'cu'],
  boron: ['boro', 'b'],
};

const TALHAO_HEADERS = ['talhao', 'talhao_gleba', 'gleba'];
const YEAR_HEADERS = ['ano', 'year', 'safra'];
const DEPTH_HEADERS = ['prof', 'profundidade', 'depth'];
const DATE_HEADERS = ['data', 'data_analise', 'data_da_analise'];
const LAB_HEADERS = ['laboratorio', 'lab', 'lab_name'];

// Normaliza um cabecalho: minusculo, sem acento, separadores -> "_".
function normalizeHeader(header) {
  return String(header)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Converte texto em numero aceitando virgula decimal (pt-BR). Retorna:
// null (vazio / "-") ou NaN (invalido) para a chamada decidir.
function parseNumber(value) {
  if (value === null || value === undefined || value === '' || value === '-') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;

  let str = String(value).trim();
  if (str === '' || str === '-') return null;
  if (str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
  }
  const num = Number(str);
  return Number.isFinite(num) ? num : NaN;
}

function textOrNull(value) {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str === '' || str === '-' ? null : str;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}
function formatDateOnly(date) {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}
function excelSerialToDate(serial) {
  const code = XLSX.SSF.parse_date_code(serial);
  if (!code) return null;
  return `${code.y}-${pad2(code.m)}-${pad2(code.d)}`;
}
function parseDate(value) {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return formatDateOnly(value);
  if (typeof value === 'number') return Number.isFinite(value) ? excelSerialToDate(value) : null;
  const br = String(value).trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : formatDateOnly(parsed);
}

function isBinarySpreadsheet(buffer) {
  if (!buffer || buffer.length < 4) return false;
  if (buffer[0] === 0x50 && buffer[1] === 0x4b) return true;
  if (buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11 && buffer[3] === 0xe0) return true;
  return false;
}

function columnIndex(headers, aliases) {
  return headers.findIndex((h) => aliases.includes(h));
}

function parseSoilSpreadsheet(buffer) {
  const binary = isBinarySpreadsheet(buffer);
  // CSV/texto: decodifica como UTF-8 (evita mojibake de acento, ex.: "Talhão"
  // virando "TalhÃ£o"). Binário (.xlsx/.xls): lê direto do buffer.
  const workbook = binary
    ? XLSX.read(buffer, { type: 'buffer', cellDates: true })
    : XLSX.read(buffer.toString('utf8').replace(/^\uFEFF/, ''), { type: 'string', raw: true });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return { rows: [], errors: ['Planilha sem abas.'] };

  // Matriz crua (controlamos os cabecalhos manualmente).
  const matrix = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    defval: null,
    blankrows: false,
    raw: true,
  });
  if (matrix.length < 2) return { rows: [], errors: ['Planilha vazia ou sem dados.'] };

  const headers = (matrix[0] || []).map(normalizeHeader);
  const idx = {
    talhao: columnIndex(headers, TALHAO_HEADERS),
    year: columnIndex(headers, YEAR_HEADERS),
    depth: columnIndex(headers, DEPTH_HEADERS),
    date: columnIndex(headers, DATE_HEADERS),
    lab: columnIndex(headers, LAB_HEADERS),
  };
  const nutrientCols = {};
  Object.entries(NUTRIENT_HEADER_MAP).forEach(([attr, aliases]) => {
    const col = columnIndex(headers, aliases);
    if (col >= 0) nutrientCols[attr] = col;
  });

  // Detecta a 2a linha de cabecalho (unidades): sem ano e com textos de unidade.
  let start = 1;
  const second = matrix[1] || [];
  const secondYear = idx.year >= 0 ? Number.parseInt(second[idx.year], 10) : NaN;
  const looksUnits =
    !Number.isInteger(secondYear) &&
    second.some((v) => typeof v === 'string' && /(cmol|mg\s*\/\s*dm|g\s*\/\s*dm|%|dm³)/i.test(v));
  if (looksUnits) start = 2;

  const rows = [];
  const errors = [];
  let talhao = null;
  let year = null;

  for (let r = start; r < matrix.length; r += 1) {
    const line = matrix[r] || [];
    const lineNo = r + 1;
    if (line.every((c) => c === null || c === '')) continue;

    // forward-fill de Talhao e Ano (celulas mescladas no laudo).
    if (idx.talhao >= 0) {
      const t = textOrNull(line[idx.talhao]);
      if (t) talhao = t;
    }
    if (idx.year >= 0) {
      const y = Number.parseInt(line[idx.year], 10);
      if (Number.isInteger(y)) year = y;
    }

    if (!Number.isInteger(year)) {
      errors.push(`linha ${lineNo}: ano ausente.`);
      continue;
    }

    const attrs = { year };
    if (talhao) attrs.talhao = talhao;

    if (idx.depth >= 0) {
      const depthRaw = textOrNull(line[idx.depth]);
      attrs.depth = depthRaw ? `${depthRaw} cm` : null;
    } else {
      attrs.depth = null;
    }
    attrs.analysisDate = idx.date >= 0 ? parseDate(line[idx.date]) : null;
    attrs.labName = idx.lab >= 0 ? textOrNull(line[idx.lab]) : null;

    let hasValue = false;
    Object.entries(nutrientCols).forEach(([attr, col]) => {
      const num = parseNumber(line[col]);
      if (Number.isNaN(num)) {
        errors.push(`linha ${lineNo}: valor invalido na coluna "${headers[col]}".`);
      } else if (num !== null) {
        attrs[attr] = num;
        hasValue = true;
      }
    });

    // Linha de ano sem nenhum resultado (analise nao feita): ignora para nao
    // gerar "buracos" vazios nos graficos.
    if (!hasValue) continue;

    rows.push(attrs);
  }

  return { rows, errors };
}

module.exports = { parseSoilSpreadsheet, normalizeHeader, parseNumber };
