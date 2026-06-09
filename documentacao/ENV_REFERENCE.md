# Referência de variáveis de ambiente — variant-api

Cada variável usada pelo projeto. Mantenha este arquivo e `.env.example`
sincronizados sempre que surgir uma nova variável.

| Variável         | Obrigatória | Padrão        | Descrição                                                                 | Exemplo (seguro)     |
|------------------|-------------|---------------|---------------------------------------------------------------------------|----------------------|
| `NODE_ENV`       | Não         | `development` | Ambiente de execução.                                                     | `development`        |
| `APP_PORT`       | Não         | `3000`        | Porta HTTP em que a API escuta.                                           | `3000`               |
| `APP_API_PREFIX` | Não         | `/api/v1`     | Prefixo das rotas públicas versionadas.                                   | `/api/v1`            |
| `DB_HOST`        | Sim         | —             | Host do PostgreSQL.                                                       | `localhost`          |
| `DB_PORT`        | Não         | `5432`        | Porta do PostgreSQL.                                                      | `5432`               |
| `DB_NAME`        | Sim         | —             | Nome do banco de dados.                                                   | `variant`            |
| `DB_USER`        | Sim         | —             | Usuário do banco.                                                         | `variant_user`       |
| `DB_PASSWORD`    | Sim         | —             | Senha do banco. **Nunca commitar o valor real.**                         | `••••••••`           |
| `DB_LOGGING`     | Não         | `false`       | `true` para logar as queries SQL do Sequelize no console.                | `false`              |
| `DB_SSL`         | Não         | `false`       | `true` para habilitar SSL na conexão (provedores gerenciados).           | `false`              |
| `JWT_SECRET`     | Sim         | —             | Segredo para assinar/verificar os JWT. Use valor longo e aleatório.      | `••••••••••••••••`   |
| `JWT_ACCESS_EXPIRES_IN` | Não  | `15m`         | Validade do **access token** (`jsonwebtoken`: `15m`, `1h`, `3600`).      | `15m`                |
| `REFRESH_TOKEN_EXPIRES_DAYS` | Não | `30`      | Validade do **refresh token**, em dias.                                  | `30`                 |
| `BCRYPT_SALT_ROUNDS` | Não     | `10`          | Custo (rounds) do bcrypt no hash de senhas.                              | `10`                 |
| `UPLOAD_DIR`     | Não         | `uploads`     | Diretório de armazenamento das fotos de eventos.                         | `uploads`            |
| `MAX_UPLOAD_MB`  | Não         | `10`          | Tamanho máximo de upload (planilha/KML/foto), em MB.                     | `10`                 |
| `APP_PUBLIC_URL` | Não         | `""`          | URL base pública para montar o link das fotos (vazio = caminho relativo).| `https://api.variant.agr.br` |

> **Segurança:** o `.env` real nunca deve ser versionado (já está no `.gitignore`).
> Use `.env.example` apenas com placeholders.
