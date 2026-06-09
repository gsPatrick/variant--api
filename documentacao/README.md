# variant-api — Documentação

Backend da plataforma **variant.agr.br** (Variant Mapas e Consultoria): centraliza
análises de solo e o histórico de eventos de safras por talhão, para uso de
engenheiros agrônomos (administradores) e produtores (clientes).

> **Comece por aqui.** Esta pasta é a documentação viva do projeto, mantida ao
> lado do código.

## Stack

- **Node.js** + **Express** (JavaScript, CommonJS)
- **PostgreSQL** + **Sequelize** (ORM) + **sequelize-cli** (migrations)

## Índice

- [ONBOARDING.md](./ONBOARDING.md) — como rodar local, migrar o banco, criar o primeiro usuário.
- [ENV_REFERENCE.md](./ENV_REFERENCE.md) — todas as variáveis de ambiente.
- [features/Auth.md](./features/Auth.md) — login e emissão de JWT.
- [features/Cadastro.md](./features/Cadastro.md) — cadastro guiado (cliente → projeto → informações), modos auto/confirmação.
- [features/CRUD.md](./features/CRUD.md) — CRUD de Farms/Plots/Seasons e regras de acesso (admin total / produtor leitura isolada).
- [features/Solos.md](./features/Solos.md) — módulo SOLOS (análises e gráficos de nutrientes).
- [features/Safras.md](./features/Safras.md) — módulo SAFRAS (mapa, variedades, timeline).
- [middlewares/README.md](./middlewares/README.md) — authenticate, authorize, error-handler.
- [models/DataModel.md](./models/DataModel.md) — modelo de dados campo-a-campo e relacionamentos.

## Estado atual

- **Camada de dados** completa (models, associações e migrations).
- **Auth** completo: login, **refresh token** (com rotação) e **logout**; JWT
  de acesso + refresh opaco revogável; middlewares `authenticate`/`authorize`.
- **Cadastro guiado** (`/onboarding`): cliente → projeto → informações, modos
  automático e confirmação, criação atômica.
- **SOLOS**: importação de planilha (CSV/Excel, upsert), gráfico de evolução
  (barras) e de teores do ano (radar).
- **SAFRAS**: upload de KML (→ GeoJSON + centroide), dados do mapa (contorno +
  safra ativa) e timeline (listar / cadastrar evento com foto).
- **CRUD de domínio**: Farms, Plots e Seasons — admin com controle total;
  produtor com leitura isolada (escrita → 403).
- **Multi-tenancy** aplicado em todas as leituras (`tenant-access`).
- **Seed** local (`npm run seed`) e **teste E2E** (`npm run smoke:test`) —
  validado contra PostgreSQL real (29/29 checks).

## Estrutura de pastas

```
variant--api/
├── app.js                 # Express, middlewares globais, health, erro global, listen
├── config/config.js       # configuração do sequelize-cli (migrations)
├── migrations/            # migrations ordenadas (users → ... → event_photos)
└── src/
    ├── config/            # database.js, auth.js, constants.js
    ├── models/            # um arquivo por entidade + index.js (associações)
    ├── features/          # auth, onboarding, farms, plots, seasons, soils
    ├── routes/            # index.js (único agregador da versão)
    ├── middlewares/       # authenticate, authorize, tenant-access, upload, error-handler
    └── utils/             # app-error, catch-async, api-response, password, jwt, refresh-token, validation, geo
```

> A regra de modelo de dados está descrita em [models/DataModel.md](./models/DataModel.md).
> Qualquer alteração de schema deve ser refletida em `migrations/` **e** anotada
> em [Registo_Migracoes.md](./Registo_Migracoes.md).
