# Onboarding — variant-api

Guia para subir o projeto localmente do zero.

## 1. Pré-requisitos

- Node.js >= 18
- PostgreSQL >= 13 (a extensão `pgcrypto` é habilitada automaticamente pela
  primeira migration para gerar UUIDs via `gen_random_uuid()`)

## 2. Instalar dependências

```bash
cd variant--api
npm install
```

## 3. Configurar o ambiente

Copie o arquivo de exemplo e preencha os valores locais:

```bash
cp .env.example .env
```

Edite `.env` com as credenciais do seu PostgreSQL. Veja
[ENV_REFERENCE.md](./ENV_REFERENCE.md) para o detalhe de cada variável.

## 4. Criar o banco de dados

```bash
createdb variant   # ou via psql: CREATE DATABASE variant;
```

## 5. Rodar as migrations

```bash
npm run migrate
```

Isso cria, na ordem correta: `users`, `farms`, `plots`, `soil_analyses`,
`seasons`, `season_events`, `event_photos`.

Para reverter tudo: `npm run migrate:undo:all`.

## 6. Popular dados de demonstração (seed)

```bash
npm run seed        # cria admin, produtor, 1 fazenda e 1 talhão de teste
npm run seed:undo   # remove os dados de demonstração
```

Credenciais criadas (apenas ambiente local — trocar em produção):

| Papel    | Email                    | Senha          |
|----------|--------------------------|----------------|
| admin    | `admin@variant.agr.br`   | `Admin@123`    |
| producer | `cliente@variant.agr.br` | `Cliente@123`  |

> Em produção, crie o primeiro admin manualmente (hash bcrypt) em vez do seed.

## 7. Rodar a aplicação

```bash
npm run dev      # com --watch (recarrega ao salvar)
# ou
npm start
```

A API sobe em `http://localhost:${APP_PORT}` (padrão 3000).

## 8. Verificar (health checks)

```bash
curl http://localhost:3000/health        # { "status": "ok", ... }
curl http://localhost:3000/api/v1/ping    # { "pong": true }
```

## 9. Teste de fumaça end-to-end

Com o servidor rodando e o banco seedado, em outro terminal:

```bash
npm run smoke:test   # node scripts/smoke-e2e.js
```

Valida login admin, refresh (com rotação), onboarding, KML→GeoJSON+centroide,
importação de solo, e as regras de leitura/isolamento do produtor (403 em
escrita e em recursos de terceiros). Sai com código ≠ 0 se algum check falhar.

## Logs

Os logs vão para o stdout do processo (`console`). Erros não tratados são
registrados pelo `error-handler` com o prefixo `[unhandled-error]`. As queries
SQL aparecem quando `DB_LOGGING=true`.
