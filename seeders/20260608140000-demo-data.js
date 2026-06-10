'use strict';

const bcrypt = require('bcryptjs');

// ID fixo para um seed reproduzivel.
const ADMIN_ID = '11111111-1111-4111-8111-111111111111';

const ADMIN_EMAIL = 'admin@variant.agr.br';
const ADMIN_PASSWORD = 'Admin@123';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // Idempotente: garante apenas o admin. Remove qualquer admin anterior
    // (e tambem o cliente demo legado, se existir, com seu cascade).
    await queryInterface.bulkDelete('users', {
      email: [ADMIN_EMAIL, 'cliente@variant.agr.br'],
    });

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
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: [ADMIN_EMAIL] });
  },
};
