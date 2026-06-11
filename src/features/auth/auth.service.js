const sequelize = require('../../config/database');
const { User, RefreshToken } = require('../../models');
const AppError = require('../../utils/app-error');
const { comparePassword, hashPassword } = require('../../utils/password');
const v = require('../../utils/validation');
const { signAccessToken, accessTokenExpiresIn } = require('../../utils/jwt');
const { generateRefreshToken, hashRefreshToken } = require('../../utils/refresh-token');
const { refreshTokenExpiresDays } = require('../../config/auth');

// Projeta apenas os campos publicos do usuario (nunca o hash da senha).
function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

// Perfil completo do proprio usuario (inclui documento/telefone).
function toProfile(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    document: user.document,
    phone: user.phone,
  };
}

// GET /auth/me — dados do usuario logado.
async function getMe(userId) {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError('Usuario nao encontrado.', 404, 'USER_NOT_FOUND');
  return toProfile(user);
}

// PATCH /auth/me — o usuario edita o proprio perfil (nome/email/doc/telefone)
// e, opcionalmente, troca a senha (exige a senha atual).
async function updateMe(userId, payload) {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError('Usuario nao encontrado.', 404, 'USER_NOT_FOUND');

  const errors = [];
  if (v.isPresent(payload.name) && !v.isNonEmptyString(payload.name)) {
    errors.push({ field: 'name', message: 'nome invalido.' });
  }
  if (v.isPresent(payload.email) && !v.isEmail(payload.email)) {
    errors.push({ field: 'email', message: 'email invalido.' });
  }
  if (v.isNonEmptyString(payload.newPassword) && payload.newPassword.length < 6) {
    errors.push({ field: 'newPassword', message: 'a nova senha deve ter ao menos 6 caracteres.' });
  }
  if (errors.length > 0) throw v.validationError(errors);

  if (v.isPresent(payload.email)) {
    const normalized = payload.email.trim().toLowerCase();
    if (normalized !== user.email) {
      const taken = await User.findOne({ where: { email: normalized } });
      if (taken) throw new AppError('Ja existe um usuario com este email.', 409, 'EMAIL_ALREADY_USED');
      user.email = normalized;
    }
  }
  if (v.isPresent(payload.name)) user.name = payload.name.trim();
  if (v.isPresent(payload.document)) user.document = v.isNonEmptyString(payload.document) ? payload.document.trim() : null;
  if (v.isPresent(payload.phone)) user.phone = v.isNonEmptyString(payload.phone) ? payload.phone.trim() : null;

  if (v.isNonEmptyString(payload.newPassword)) {
    const ok = await comparePassword(payload.currentPassword || '', user.passwordHash);
    if (!ok) throw new AppError('Senha atual incorreta.', 400, 'WRONG_PASSWORD');
    user.passwordHash = await hashPassword(payload.newPassword);
  }

  await user.save();
  return toProfile(user);
}

// Emite um par access + refresh, persistindo o hash do refresh.
async function issueTokens(user, { transaction } = {}) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role });

  const refreshTokenRaw = generateRefreshToken();
  const expiresAt = new Date(Date.now() + refreshTokenExpiresDays * 24 * 60 * 60 * 1000);
  await RefreshToken.create(
    {
      userId: user.id,
      tokenHash: hashRefreshToken(refreshTokenRaw),
      expiresAt,
    },
    { transaction }
  );

  return {
    accessToken,
    refreshToken: refreshTokenRaw,
    expiresIn: accessTokenExpiresIn,
    tokenType: 'Bearer',
  };
}

// Autentica por email + senha e devolve os tokens + dados publicos.
async function login({ email, password }) {
  const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });

  // Mensagem generica para nao revelar se o email existe.
  if (!user || !user.active) {
    throw new AppError('Credenciais invalidas.', 401, 'INVALID_CREDENTIALS');
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);
  if (!passwordMatches) {
    throw new AppError('Credenciais invalidas.', 401, 'INVALID_CREDENTIALS');
  }

  const tokens = await issueTokens(user);
  return { ...tokens, user: toPublicUser(user) };
}

// Recebe um refresh token valido, rotaciona (revoga o atual e emite novo par)
// e retorna o novo access token. Rotacao previne reuso de token vazado.
async function refresh({ refreshToken }) {
  if (!refreshToken) {
    throw new AppError('Refresh token e obrigatorio.', 400, 'VALIDATION_ERROR');
  }

  const stored = await RefreshToken.findOne({
    where: { tokenHash: hashRefreshToken(refreshToken) },
  });

  const isInvalid =
    !stored || stored.revokedAt !== null || stored.expiresAt.getTime() <= Date.now();
  if (isInvalid) {
    throw new AppError('Refresh token invalido ou expirado.', 401, 'INVALID_REFRESH_TOKEN');
  }

  const user = await User.findByPk(stored.userId);
  if (!user || !user.active) {
    throw new AppError('Usuario invalido ou inativo.', 401, 'INVALID_REFRESH_TOKEN');
  }

  return sequelize.transaction(async (transaction) => {
    stored.revokedAt = new Date();
    await stored.save({ transaction });
    return issueTokens(user, { transaction });
  });
}

// Revoga o refresh token informado (idempotente: nao falha se ja inexistente).
async function logout({ refreshToken }) {
  if (!refreshToken) {
    return { revoked: false };
  }

  const stored = await RefreshToken.findOne({
    where: { tokenHash: hashRefreshToken(refreshToken) },
  });

  if (stored && stored.revokedAt === null) {
    stored.revokedAt = new Date();
    await stored.save();
    return { revoked: true };
  }

  return { revoked: false };
}

module.exports = { login, refresh, logout, toPublicUser, getMe, updateMe };
