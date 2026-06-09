// Refresh token persistido (apenas o hash). Permite renovar o access token e
// revogar a sessao (logout). Um usuario pode ter varios tokens ativos
// (multiplos dispositivos); a rotacao revoga o token usado e emite outro.
module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define(
    'RefreshToken',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
      },
      // SHA-256 do token bruto entregue ao cliente (nunca o token em claro).
      tokenHash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
        field: 'token_hash',
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at',
      },
      // Preenchido quando o token e revogado (logout ou rotacao).
      revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'revoked_at',
      },
    },
    {
      tableName: 'refresh_tokens',
      underscored: true,
      timestamps: true,
    }
  );

  return RefreshToken;
};
