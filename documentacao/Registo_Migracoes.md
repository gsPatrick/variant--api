# Registo de Migrações — variant-api

Changelog curto das alterações de schema. Adicione uma linha sempre que criar
ou alterar uma migration.

| Data       | Migration                              | Descrição                                                        |
|------------|----------------------------------------|------------------------------------------------------------------|
| 2026-06-08 | `20260608120000-create-users`          | Cria `users` + habilita `pgcrypto`; índices em email e role.     |
| 2026-06-08 | `20260608120100-create-farms`          | Cria `farms` (FK `producer_id` → users); índice em producer_id.  |
| 2026-06-08 | `20260608120200-create-plots`          | Cria `plots` (FK `farm_id`); geometry GeoJSON; índice farm_id.   |
| 2026-06-08 | `20260608120300-create-soil-analyses`  | Cria `soil_analyses` (FK `plot_id`); nutrientes DECIMAL; índices plot_id e (plot_id, year). |
| 2026-06-08 | `20260608120400-create-seasons`        | Cria `seasons` (FK `plot_id`); ENUM crop; índices plot_id e (plot_id, year). |
| 2026-06-08 | `20260608120500-create-season-events`  | Cria `season_events` (FK `season_id`); ENUM event_type; índices season_id e (season_id, event_date). |
| 2026-06-08 | `20260608120600-create-event-photos`   | Cria `event_photos` (FK `event_id`); índice event_id.            |
| 2026-06-08 | `20260608120700-create-refresh-tokens` | Cria `refresh_tokens` (FK `user_id`); `token_hash` único; índices user_id e token_hash. |
| 2026-06-09 | `20260609090000-add-ph-cacl2-to-soil-analyses` | Adiciona coluna `ph_cacl2` em `soil_analyses` (pH CaCl2, separado do `ph` = pH água). |
