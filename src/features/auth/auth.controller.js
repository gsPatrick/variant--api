const catchAsync = require('../../utils/catch-async');
const { sendSuccess } = require('../../utils/api-response');
const AppError = require('../../utils/app-error');
const authService = require('./auth.service');

// POST /auth/login
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    throw new AppError('Email e senha sao obrigatorios.', 400, 'VALIDATION_ERROR');
  }
  const result = await authService.login({ email, password });
  return sendSuccess(res, { data: result });
});

// POST /auth/refresh
const refresh = catchAsync(async (req, res) => {
  const { refreshToken } = req.body || {};
  const result = await authService.refresh({ refreshToken });
  return sendSuccess(res, { data: result });
});

// POST /auth/logout — revoga o refresh token (idempotente).
const logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.body || {};
  await authService.logout({ refreshToken });
  return sendSuccess(res, { message: 'Logout efetuado.' });
});

// GET /auth/me — perfil do usuário logado.
const me = catchAsync(async (req, res) => {
  const data = await authService.getMe(req.user.id);
  return sendSuccess(res, { data });
});

// PATCH /auth/me — atualiza o próprio perfil (dados + senha).
const updateMe = catchAsync(async (req, res) => {
  const data = await authService.updateMe(req.user.id, req.body || {});
  return sendSuccess(res, { data, message: 'Perfil atualizado.' });
});

module.exports = { login, refresh, logout, me, updateMe };
