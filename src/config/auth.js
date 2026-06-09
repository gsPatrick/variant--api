// Configuracao de autenticacao agrupada (evita process.env espalhado).
// Lida em src/utils/jwt.js, src/utils/password.js e na feature auth.
module.exports = {
  jwtSecret: process.env.JWT_SECRET,
  // Access token e curto; o refresh token (opaco, no banco) permite renovar.
  accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshTokenExpiresDays: Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 30,
  // Custo do bcrypt. 10 e um bom equilibrio entre seguranca e desempenho.
  saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
};
