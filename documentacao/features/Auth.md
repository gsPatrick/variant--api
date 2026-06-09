# Feature — AUTH (Login)

Autenticação por email + senha, emitindo um **JWT** usado pelas rotas protegidas.
Pasta: `src/features/auth/`.

## Modelo de tokens

- **Access token**: JWT curto (`JWT_ACCESS_EXPIRES_IN`, padrão `15m`), enviado
  em `Authorization: Bearer <accessToken>`.
- **Refresh token**: string opaca aleatória, guardada no banco apenas como hash
  SHA-256 (tabela `refresh_tokens`), válida por `REFRESH_TOKEN_EXPIRES_DAYS`
  (padrão 30). Permite renovar o acesso e é **revogável** (logout).

## Endpoints (prefixo `APP_API_PREFIX`, padrão `/api/v1`)

### POST `/auth/login`
```json
{ "email": "admin@variant.agr.br", "password": "••••••••" }
```
Resposta `200`:
```json
{
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<opaco>",
    "expiresIn": "15m",
    "tokenType": "Bearer",
    "user": { "id": "uuid", "name": "Agrônomo", "email": "admin@variant.agr.br", "role": "admin" }
  }
}
```

### POST `/auth/refresh`
Troca um refresh token válido por um novo par (com **rotação**: o token usado é
revogado e um novo é emitido).
```json
{ "refreshToken": "<opaco>" }
```
Resposta `200`: `{ "data": { "accessToken", "refreshToken", "expiresIn", "tokenType" } }`.

### POST `/auth/logout`
Revoga o refresh token informado (idempotente — sempre `200`).
```json
{ "refreshToken": "<opaco>" }
```

## Como funciona

- `login` valida email/senha (bcrypt) e chama `issueTokens` (assina o access em
  `utils/jwt`, gera o refresh em `utils/refresh-token` e persiste o hash).
- `refresh` verifica hash/expiração/revogação, então rotaciona em transação.
- Mensagem genérica (`401 INVALID_CREDENTIALS`) para não revelar se o email existe.

## Middlewares relacionados

- `middlewares/authenticate.js` — valida o Bearer token e popula `req.user`.
- `middlewares/authorize.js` — `authorize(...roles)` restringe por perfil.

Ver [../middlewares/README.md](../middlewares/README.md).

## Variáveis de ambiente

`JWT_SECRET` (obrigatória), `JWT_EXPIRES_IN`, `BCRYPT_SALT_ROUNDS` — ver
[../ENV_REFERENCE.md](../ENV_REFERENCE.md).

## Erros comuns

| HTTP | code                  | Quando                                |
|------|-----------------------|---------------------------------------|
| 400  | `VALIDATION_ERROR`    | Email/senha ausentes ou refresh token ausente. |
| 401  | `INVALID_CREDENTIALS` | Email inexistente, inativo ou senha errada. |
| 401  | `INVALID_REFRESH_TOKEN` | Refresh token inválido, expirado ou revogado. |
| 500  | `CONFIG_ERROR`        | `JWT_SECRET` não configurado.         |
