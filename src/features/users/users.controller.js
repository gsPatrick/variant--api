const catchAsync = require('../../utils/catch-async');
const { sendSuccess } = require('../../utils/api-response');
const usersService = require('./users.service');

// GET /users — lista produtores com fazendas e talhoes (arvore + tabela).
const list = catchAsync(async (req, res) => {
  const data = await usersService.listProducers();
  return sendSuccess(res, { data });
});

// PATCH /users/:id — atualiza dados, status (active) e/ou senha.
const update = catchAsync(async (req, res) => {
  const data = await usersService.updateUser(req.params.id, req.body || {});
  return sendSuccess(res, { data, message: 'Produtor atualizado.' });
});

// DELETE /users/:id — remove o produtor e dados vinculados (cascade).
const remove = catchAsync(async (req, res) => {
  await usersService.removeUser(req.params.id);
  return sendSuccess(res, { message: 'Produtor removido.' });
});

module.exports = { list, update, remove };
