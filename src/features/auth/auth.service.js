const sequelize = require('../../config/database');
const { User, RefreshToken } = require('../../models');
const AppError = require('../../utils/app-error');
const { comparePassword } = require('../../utils/password');
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

module.exports = { login, refresh, logout, toPublicUser };
