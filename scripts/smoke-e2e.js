'use strict';

/**
 * Teste de fumaca end-to-end. Requer o servidor rodando e o banco migrado +
 * seedado. Uso: node scripts/smoke-e2e.js  (ou npm run smoke:test)
 *
 * Cobre: login admin, refresh, onboarding, KML, importacao de solo, leituras
 * do produtor e isolamento (403 em escrita e em recursos de terceiros).
 */
const BASE = process.env.E2E_BASE || 'http://localhost:3000/api/v1';

// Plot/produtor criados pelo seed (outro tenant) — usados no teste de isolamento.
const SEED_PLOT_ID = '44444444-4444-4444-8444-444444444444';

let pass = 0;
let fail = 0;

function check(name, cond, extra) {
  if (cond) {
    pass += 1;
    console.log(`  ✓ ${name}`);
  } else {
    fail += 1;
    console.error(`  ✗ ${name}${extra !== undefined ? ` -> ${JSON.stringify(extra)}` : ''}`);
  }
}

async function api(method, path, { token, json, form } = {}) {
  const headers = {};
  let body;
  if (token) headers.Authorization = `Bearer ${token}`;
  if (json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  }
  if (form) body = form;

  const res = await fetch(BASE + path, { method, headers, body });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

function fileForm(field, filename, content, type) {
  const fd = new FormData();
  fd.append(field, new Blob([content], { type }), filename);
  return fd;
}

const KML = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2"><Document><Placemark><Polygon>
<outerBoundaryIs><LinearRing><coordinates>
-55.0,-12.0,0 -55.0,-11.0,0 -54.0,-11.0,0 -54.0,-12.0,0 -55.0,-12.0,0
</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></Document></kml>`;

const SOIL_CSV = [
  'Ano,Profundidade,Calcio,Magnesio,Fosforo,Materia Organica',
  '2022,0-20cm,"3,1",1.0,10,40',
  '2023,0-20cm,"3,5",1.2,12,45',
].join('\n');

async function main() {
  console.log(`E2E contra ${BASE}\n`);

  // 1) Login admin -------------------------------------------------------
  console.log('1) Login do administrador');
  let r = await api('POST', '/auth/login', {
    json: { email: 'admin@variant.agr.br', password: 'Admin@123' },
  });
  check('login admin 200', r.status === 200, r.data);
  const adminToken = r.data?.data?.accessToken;
  const adminRefresh = r.data?.data?.refreshToken;
  check('recebeu accessToken', !!adminToken);
  check('recebeu refreshToken', !!adminRefresh);
  check('role admin', r.data?.data?.user?.role === 'admin');

  // 2) Refresh -----------------------------------------------------------
  console.log('2) Renovacao de sessao (refresh)');
  r = await api('POST', '/auth/refresh', { json: { refreshToken: adminRefresh } });
  check('refresh 200', r.status === 200, r.data);
  check('novo accessToken', !!r.data?.data?.accessToken);
  const adminToken2 = r.data?.data?.accessToken || adminToken;
  r = await api('POST', '/auth/refresh', { json: { refreshToken: adminRefresh } });
  check('refresh reusado falha 401 (rotacao)', r.status === 401, r.status);

  // 3) Onboarding de novo cliente ---------------------------------------
  console.log('3) Onboarding (cadastro guiado) de novo cliente');
  const stamp = Date.now();
  const clienteEmail = `e2e+${stamp}@variant.agr.br`;
  const clientePass = 'E2eCliente@123';
  r = await api('POST', '/onboarding', {
    token: adminToken2,
    json: {
      mode: 'automatico',
      cliente: { name: 'Cliente E2E', email: clienteEmail, password: clientePass },
      projeto: { name: 'Fazenda E2E', city: 'Lucas do Rio Verde', state: 'MT', totalAreaHa: 500.5 },
      informacoes: { plots: [{ name: 'Talhao E2E', areaHa: 60.5 }] },
    },
  });
  check('onboarding 201', r.status === 201, r.data);
  const newPlotId = r.data?.data?.talhoes?.[0]?.id;
  const newFarmId = r.data?.data?.projeto?.id;
  check('criou talhao', !!newPlotId);
  check('criou fazenda', !!newFarmId);

  // 4) KML do talhao -----------------------------------------------------
  console.log('4) Upload de KML (contorno + centroide)');
  r = await api('POST', `/plots/${newPlotId}/kml`, {
    token: adminToken2,
    form: fileForm('arquivo', 'contorno.kml', KML, 'application/vnd.google-earth.kml+xml'),
  });
  check('kml 200', r.status === 200, r.data);
  check('gerou geometria', (r.data?.data?.geometry?.features?.length || 0) > 0);
  const c = r.data?.data?.centroid;
  check('calculou centroide', c && c.lat !== null && c.lng !== null, c);

  // 5) Importacao de planilha de solo -----------------------------------
  console.log('5) Importacao de analises de solo');
  r = await api('POST', `/plots/${newPlotId}/soil-analyses/import`, {
    token: adminToken2,
    form: fileForm('arquivo', 'analises.csv', SOIL_CSV, 'text/csv'),
  });
  check('import 201', r.status === 201, r.data);
  check('inseriu 2 linhas', r.data?.data?.inseridos === 2, r.data?.data);
  r = await api('GET', `/plots/${newPlotId}/soil-analyses/evolution?nutriente=calcio`, { token: adminToken2 });
  check('evolution 200 com serie', r.status === 200 && (r.data?.data?.series?.length || 0) === 2, r.data);
  r = await api('GET', `/plots/${newPlotId}/soil-analyses/radar?year=2023`, { token: adminToken2 });
  check('radar 200 com teores', r.status === 200 && (r.data?.data?.teores?.length || 0) === 10, r.data);

  // 6) Produtor: leitura propria + isolamento ---------------------------
  console.log('6) Login do produtor e regras de isolamento');
  r = await api('POST', '/auth/login', { json: { email: clienteEmail, password: clientePass } });
  check('login produtor 200', r.status === 200, r.data);
  const prodToken = r.data?.data?.accessToken;
  check('produtor role producer', r.data?.data?.user?.role === 'producer');

  r = await api('GET', '/farms', { token: prodToken });
  const prodFarms = r.data?.data || [];
  check('produtor lista 200', r.status === 200);
  check('produtor ve apenas a propria fazenda', prodFarms.length === 1 && prodFarms[0].id === newFarmId, prodFarms.map((f) => f.id));

  r = await api('GET', `/plots/${newPlotId}/map`, { token: prodToken });
  check('produtor le mapa do proprio talhao 200', r.status === 200, r.status);

  r = await api('GET', `/plots/${SEED_PLOT_ID}`, { token: prodToken });
  check('produtor 403 ao ler talhao de terceiro', r.status === 403, r.status);

  r = await api('POST', '/farms', { token: prodToken, json: { producerId: 'x', name: 'Hack' } });
  check('produtor 403 ao criar fazenda', r.status === 403, r.status);

  r = await api('PUT', `/plots/${newPlotId}`, { token: prodToken, json: { name: 'Alterado' } });
  check('produtor 403 ao editar talhao (mesmo proprio)', r.status === 403, r.status);

  r = await api('DELETE', `/farms/${newFarmId}`, { token: prodToken });
  check('produtor 403 ao excluir fazenda', r.status === 403, r.status);

  // 7) Admin: controle total --------------------------------------------
  console.log('7) Controle total do admin');
  r = await api('POST', '/seasons', {
    token: adminToken2,
    json: { plotId: newPlotId, crop: 'soja', variety: 'Ares 7200', year: 2024, seasonLabel: '2023/2024' },
  });
  check('admin cria safra 201', r.status === 201, r.data);
  const seasonId = r.data?.data?.id;
  r = await api('GET', `/plots/${SEED_PLOT_ID}`, { token: adminToken2 });
  check('admin le talhao de qualquer cliente 200', r.status === 200, r.status);
  r = await api('DELETE', `/seasons/${seasonId}`, { token: adminToken2 });
  check('admin exclui safra 200', r.status === 200, r.status);

  // Resultado ------------------------------------------------------------
  console.log(`\nResultado: ${pass} passaram, ${fail} falharam.`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('Erro inesperado no E2E:', err);
  process.exit(1);
});
