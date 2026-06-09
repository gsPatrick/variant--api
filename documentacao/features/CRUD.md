# Feature — CRUD de domínio (Farms, Plots, Seasons)

CRUD completo das entidades essenciais fora do onboarding, com a regra de acesso
do projeto. Pastas: `src/features/farms/`, `src/features/plots/`,
`src/features/seasons/`.

## Regra de acesso (multi-tenancy)

- **Admin** — controle total, global e irrestrito: cria, lê, edita e exclui
  qualquer registro de qualquer cliente.
- **Produtor** — **somente leitura** (`GET`) e **isolado pelo seu `id`**: só
  enxerga fazendas/talhões/safras das suas próprias fazendas. Qualquer escrita
  (`POST`/`PUT`/`DELETE`) retorna **403 Forbidden**; ler recurso de terceiro
  retorna **403**.

Implementação: rotas de escrita usam `authorize('admin')`; leituras de item
único usam `resolve*Access` (tenant); listagens filtram pelo `producer_id` do
produtor logado.

## Endpoints (prefixo `APP_API_PREFIX`, padrão `/api/v1`)

### Fazendas — `/farms`
| Método | Rota              | Acesso   | Corpo / Query |
|--------|-------------------|----------|---------------|
| GET    | `/farms`          | admin/produtor | admin: `?producerId` (opcional); produtor: só as próprias |
| GET    | `/farms/:farmId`  | admin/produtor (tenant) | — |
| POST   | `/farms`          | **admin**| `{ producerId, name, city?, state?, totalAreaHa? }` |
| PUT    | `/farms/:farmId`  | **admin**| campos parciais (inclui `producerId` p/ reatribuir) |
| DELETE | `/farms/:farmId`  | **admin**| — (cascade remove talhões/safras/análises) |

### Talhões — `/plots`
| Método | Rota              | Acesso   | Corpo / Query |
|--------|-------------------|----------|---------------|
| GET    | `/plots`          | admin/produtor | admin: `?farmId` (opcional); produtor: só os seus |
| GET    | `/plots/:plotId`  | admin/produtor (tenant) | — |
| POST   | `/plots`          | **admin**| `{ farmId, name, areaHa?, geometry?, kmlFilename?, centroidLat?, centroidLng? }` |
| PUT    | `/plots/:plotId`  | **admin**| campos parciais (inclui `farmId`) |
| DELETE | `/plots/:plotId`  | **admin**| — (cascade) |

> Também em `/plots`: `POST /:plotId/kml`, `GET /:plotId/map` (ver [Safras.md](./Safras.md))
> e `/:plotId/soil-analyses/*` (ver [Solos.md](./Solos.md)).

### Safras — `/seasons`
| Método | Rota                 | Acesso   | Corpo / Query |
|--------|----------------------|----------|---------------|
| GET    | `/seasons`           | admin/produtor | admin: `?plotId` (opcional); produtor: só as suas |
| GET    | `/seasons/:seasonId` | admin/produtor (tenant) | — |
| POST   | `/seasons`           | **admin**| `{ plotId, crop, variety, year, seasonLabel?, startDate?, endDate?, markerLat?, markerLng? }` |
| PUT    | `/seasons/:seasonId` | **admin**| campos parciais |
| DELETE | `/seasons/:seasonId` | **admin**| — (cascade remove eventos/fotos) |

> `crop` ∈ `soja`, `milho`. Também em `/seasons`: timeline `/:seasonId/events`
> (ver [Safras.md](./Safras.md)).

## Erros comuns

| HTTP | code               | Quando                                            |
|------|--------------------|---------------------------------------------------|
| 400  | `VALIDATION_ERROR` | Payload inválido (`details` lista os campos).     |
| 403  | `FORBIDDEN`        | Produtor em escrita, ou leitura de recurso alheio.|
| 404  | `FARM_NOT_FOUND` / `PLOT_NOT_FOUND` / `SEASON_NOT_FOUND` | Recurso inexistente. |
| 404  | `CLIENT_NOT_FOUND` | `producerId` inexistente (create/update de fazenda).|
| 422  | `CLIENT_NOT_PRODUCER` | `producerId` aponta para usuário não-produtor. |
