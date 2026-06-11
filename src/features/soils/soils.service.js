const sequelize = require('../../config/database');
const { SoilAnalysis } = require('../../models');
const AppError = require('../../utils/app-error');
const { NUTRIENT_FIELDS, NUTRIENT_KEYS, RADAR_NUTRIENTS, RADAR_SYMBOLS } = require('./soils.constants');
const { parseSoilSpreadsheet } = require('./soil-spreadsheet.helper');

// Chave de deduplicacao de uma analise dentro de um talhao: ano + profundidade.
function analysisKey(year, depth) {
  return `${year}::${depth || ''}`;
}

// Importa a planilha e faz upsert por (talhao, ano, profundidade) em transacao.
async function importSpreadsheet(plot, fileBuffer, originalName) {
  const { rows, errors } = parseSoilSpreadsheet(fileBuffer);

  if (errors.length > 0) {
    const error = new AppError('A planilha contem linhas invalidas.', 422, 'IMPORT_VALIDATION_ERROR');
    error.details = errors;
    throw error;
  }
  if (rows.length === 0) {
    throw new AppError('Nenhuma linha valida encontrada na planilha.', 422, 'EMPTY_IMPORT');
  }

  // Planilha multi-talhao (laudo): filtra as linhas do talhao selecionado pelo
  // nome. Sem coluna de talhao, importa todas as linhas para o talhao atual.
  // Casa o nome do talhao ignorando maiusculas, espaços nas pontas e acentos.
  const norm = (s) =>
    String(s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  const hasTalhao = rows.some((r) => r.talhao);
  const scoped = hasTalhao ? rows.filter((r) => norm(r.talhao) === norm(plot.name)) : rows;

  if (hasTalhao && scoped.length === 0) {
    const found = [...new Set(rows.map((r) => r.talhao).filter(Boolean))];
    throw new AppError(
      `A planilha nao contem linhas para o talhao "${plot.name}". Talhoes encontrados: ${found.join(', ')}.`,
      422,
      'PLOT_NOT_IN_FILE'
    );
  }

  return sequelize.transaction(async (transaction) => {
    const existing = await SoilAnalysis.findAll({ where: { plotId: plot.id }, transaction });
    const byKey = new Map(existing.map((a) => [analysisKey(a.year, a.depth), a]));

    let inserted = 0;
    let updated = 0;

    for (const row of scoped) {
      const data = { ...row };
      delete data.talhao;
      const attrs = { ...data, plotId: plot.id, sourceFile: originalName || null };
      const key = analysisKey(row.year, row.depth);
      const found = byKey.get(key);

      if (found) {
        // eslint-disable-next-line no-await-in-loop
        await found.update(attrs, { transaction });
        updated += 1;
      } else {
        // eslint-disable-next-line no-await-in-loop
        const created = await SoilAnalysis.create(attrs, { transaction });
        byKey.set(key, created);
        inserted += 1;
      }
    }

    return { totalLinhas: scoped.length, inseridos: inserted, atualizados: updated };
  });
}

// Grafico de barras: serie historica (ano -> valor) de um nutriente.
async function evolution(plot, nutrienteKey) {
  const field = NUTRIENT_FIELDS[nutrienteKey];
  if (!field) {
    throw new AppError(
      `Nutriente invalido. Use um de: ${NUTRIENT_KEYS.join(', ')}.`,
      400,
      'INVALID_NUTRIENT'
    );
  }

  const analyses = await SoilAnalysis.findAll({
    where: { plotId: plot.id },
    order: [['year', 'ASC']],
  });

  const series = analyses.map((a) => ({
    year: a.year,
    valor: a[field] !== null && a[field] !== undefined ? Number(a[field]) : null,
  }));

  return { plotId: plot.id, nutriente: nutrienteKey, series };
}

// Grafico de radar: todos os teores de um ano especifico.
async function radar(plot, year) {
  if (!Number.isInteger(year)) {
    throw new AppError('Parametro "year" e obrigatorio e deve ser um ano valido.', 400, 'INVALID_YEAR');
  }

  const analysis = await SoilAnalysis.findOne({
    where: { plotId: plot.id, year },
    order: [['analysis_date', 'DESC']],
  });

  if (!analysis) {
    throw new AppError('Nenhuma analise encontrada para o ano informado.', 404, 'ANALYSIS_NOT_FOUND');
  }

  const teores = RADAR_NUTRIENTS.map((key) => {
    const value = analysis[NUTRIENT_FIELDS[key]];
    // Devolve o símbolo curto (P, Zn, ...) para casar com os ideais e o eixo do gráfico.
    return { nutriente: RADAR_SYMBOLS[key] || key, valor: value !== null && value !== undefined ? Number(value) : null };
  });

  return { plotId: plot.id, year, teores };
}

module.exports = { importSpreadsheet, evolution, radar };
