# Feature — SAFRAS

Mapa do talhão (contorno + marcador da safra) e linha do tempo de eventos.
Pastas: `src/features/plots/` (KML e mapa) e `src/features/seasons/` (timeline).

Todas as rotas exigem autenticação. Leituras aplicam **multi-tenancy**
(`resolvePlotAccess` / `resolveSeasonAccess`): produtor só acessa recursos das
suas fazendas (senão `403`).

## Endpoints (prefixo `APP_API_PREFIX`, padrão `/api/v1`)

### POST `/plots/:plotId/kml` — **admin**
Upload do contorno em KML. `multipart/form-data`, campo **`arquivo`** (`.kml`).
O sistema converte os polígonos em **GeoJSON** (salvo em `plots.geometry`),
calcula o **centroide** (`centroid_lat`/`lng`) e registra o nome do arquivo.

Resposta `200`:
```json
{ "data": { "id": "uuid", "name": "Talhão 1", "kmlFilename": "t1.kml",
  "centroid": { "lat": -11.5, "lng": -54.5 },
  "geometry": { "type": "FeatureCollection", "features": [ /* ... */ ] } },
  "message": "Contorno do talhao atualizado." }
```

### GET `/plots/:plotId/map`
Contorno (GeoJSON) + safra ativa (mais recente por ano/início).
```json
{ "data": {
  "talhao": { "id": "uuid", "name": "Talhão 1", "areaHa": 80.25,
    "geometry": { "type": "FeatureCollection", "features": [] },
    "centroid": { "lat": -11.5, "lng": -54.5 } },
  "safraAtiva": { "id": "uuid", "crop": "soja", "variety": "Ares 7200",
    "seasonLabel": "2023/2024", "year": 2024,
    "marker": { "lat": -11.5, "lng": -54.5 } } } }
```
`marker` usa `marker_lat/lng` da safra ou, na ausência, o centroide do talhão.
`safraAtiva` é `null` se o talhão não tem safras.

### GET `/seasons/:seasonId/events`
Timeline ordenada por data, com fotos de cada evento.
```json
{ "data": [
  { "id": "uuid", "eventType": "plantio", "title": "Plantio soja",
    "description": "...", "eventDate": "2023-11-05",
    "photos": [ { "id": "uuid", "url": "/uploads/event-photos/....jpg", "caption": null } ] }
] }
```

### POST `/seasons/:seasonId/events` — **admin**
Cadastra evento na timeline com foto opcional. `multipart/form-data`:
- campos texto: `title` (obrigatório), `eventDate` (`YYYY-MM-DD`, obrigatório),
  `eventType` (`plantio`|`adubacao`|`aplicacao_defensivos`|`irrigacao`|`colheita`|`outro`, padrão `outro`),
  `description`, `caption`
- arquivo: campo **`foto`** (`.jpg`, `.jpeg`, `.png`, `.webp`) — opcional

Resposta `201`: o evento criado (mesmo formato de `formatEvent`, com `photos`).
A foto é gravada em `UPLOAD_DIR/event-photos/` e servida em `/uploads/...`.

## Erros comuns

| HTTP | code               | Quando                                        |
|------|--------------------|-----------------------------------------------|
| 400  | `NO_FILE`          | Upload de KML sem o campo `arquivo`.          |
| 400  | `VALIDATION_ERROR` | Evento sem `title`/`eventDate` válidos.       |
| 400  | `UPLOAD_ERROR`     | Arquivo maior que `MAX_UPLOAD_MB` (multer).   |
| 400  | `UNSUPPORTED_FILE` | Extensão não permitida.                       |
| 403  | `FORBIDDEN`        | Produtor acessando recurso de terceiros.      |
| 404  | `PLOT_NOT_FOUND` / `SEASON_NOT_FOUND` | Recurso inexistente.       |
| 422  | `INVALID_KML`      | KML sem polígonos válidos.                     |
