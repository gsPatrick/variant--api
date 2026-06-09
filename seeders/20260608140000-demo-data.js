'use strict';

const bcrypt = require('bcryptjs');

// IDs fixos para um seed reproduzivel (ambiente local).
const ADMIN_ID = '11111111-1111-4111-8111-111111111111';
const PRODUCER_ID = '22222222-2222-4222-8222-222222222222';
const FARM_ID = '33333333-3333-4333-8333-333333333333';
const PLOT_ID = '44444444-4444-4444-8444-444444444444';

const ADMIN_EMAIL = 'admin@variant.agr.br';
const PRODUCER_EMAIL = 'cliente@variant.agr.br';

// Senhas de DEMO (apenas ambiente local) — alterar/remover em producao.
const ADMIN_PASSWORD = 'Admin@123';
const PRODUCER_PASSWORD = 'Cliente@123';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // Idempotente: remove o seed anterior (cascade limpa fazendas/talhoes).
    await queryInterface.bulkDelete('users', { email: [ADMIN_EMAIL, PRODUCER_EMAIL] });

    await queryInterface.bulkInsert('users', [
      {
        id: ADMIN_ID,
        name: 'Administrador Global',
        email: ADMIN_EMAIL,
        password_hash: bcrypt.hashSync(ADMIN_PASSWORD, 10),
        role: 'admin',
        document: null,
        phone: null,
        active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: PRODUCER_ID,
        name: 'Cliente Teste',
        email: PRODUCER_EMAIL,
        password_hash: bcrypt.hashSync(PRODUCER_PASSWORD, 10),
        role: 'producer',
        document: '000.000.000-00',
        phone: null,
        active: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert('farms', [
      {
        id: FARM_ID,
        producer_id: PRODUCER_ID,
        name: 'Fazenda Modelo',
        city: 'Sorriso',
        state: 'MT',
        total_area_ha: 1200.5,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert('plots', [
      {
        id: PLOT_ID,
        farm_id: FARM_ID,
        name: 'Talhao 1',
        area_ha: 80.25,
        geometry: null,
        kml_filename: null,
        centroid_lat: null,
        centroid_lng: null,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    // Cascade remove fazenda e talhao ao apagar os usuarios demo.
    await queryInterface.bulkDelete('users', { email: [ADMIN_EMAIL, PRODUCER_EMAIL] });
  },
};
