# Modelo de dados — variant-api

Contrato campo-a-campo das entidades e seus relacionamentos. Todos os IDs são
**UUID** gerados no banco (`gen_random_uuid()`). Convenção: atributos camelCase
nos models do Sequelize, colunas snake_case no banco (`underscored: true`).

## Diagrama de relacionamentos

```
User (producer) 1 ──< Farm 1 ──< Plot 1 ──< SoilAnalysis
                                      │
                                      └──< Season 1 ──< SeasonEvent 1 ──< EventPhoto
```

Todas as FKs usam `onDelete: CASCADE` e `onUpdate: CASCADE`.

---

## users
Base do multi-tenancy. `admin` = agrônomo (acesso total); `producer` = cliente
(só vê suas fazendas).

| Coluna          | Tipo            | Nulo | Notas                                  |
|-----------------|-----------------|------|----------------------------------------|
| id              | UUID            | não  | PK, default `gen_random_uuid()`        |
| name            | VARCHAR(150)    | não  |                                        |
| email           | VARCHAR(150)    | não  | **unique**                             |
| password_hash   | VARCHAR(255)    | não  | hash bcrypt (nunca a senha em claro)   |
| role            | ENUM            | não  | `admin` \| `producer` (default producer)|
| document        | VARCHAR(20)     | sim  | CPF/CNPJ do produtor                   |
| phone           | VARCHAR(30)     | sim  |                                        |
| active          | BOOLEAN         | não  | default `true`                         |
| created_at/updated_at | TIMESTAMP | não  |                                        |

Índices: `users_email_unique`, `users_role_idx`.

## farms
Fazendas de um produtor.

| Coluna        | Tipo          | Nulo | Notas                                   |
|---------------|---------------|------|-----------------------------------------|
| id            | UUID          | não  | PK                                      |
| producer_id   | UUID          | não  | FK → users.id (CASCADE)                 |
| name          | VARCHAR(150)  | não  |                                         |
| city          | VARCHAR(120)  | sim  |                                         |
| state         | VARCHAR(2)    | sim  | UF                                      |
| total_area_ha | DECIMAL(12,2) | sim  | área total em hectares                  |

Índice: `farms_producer_id_idx`.

## plots
Talhões de uma fazenda. `geometry` guarda o GeoJSON convertido do KML.

| Coluna       | Tipo          | Nulo | Notas                                    |
|--------------|---------------|------|------------------------------------------|
| id           | UUID          | não  | PK                                       |
| farm_id      | UUID          | não  | FK → farms.id (CASCADE)                  |
| name         | VARCHAR(150)  | não  |                                          |
| area_ha      | DECIMAL(12,2) | sim  | hectares                                 |
| geometry     | JSONB         | sim  | GeoJSON do contorno (origem: KML)        |
| kml_filename | VARCHAR(255)  | sim  | arquivo KML original                     |
| centroid_lat | DECIMAL(10,7) | sim  | centro do talhão (mapa)                  |
| centroid_lng | DECIMAL(10,7) | sim  |                                          |

Índice: `plots_farm_id_idx`.

## soil_analyses
Análise de solo por talhão e ano (módulo SOLOS). Nutrientes em DECIMAL.

| Coluna             | Tipo           | Nulo | Notas                               |
|--------------------|----------------|------|-------------------------------------|
| id                 | UUID           | não  | PK                                  |
| plot_id            | UUID           | não  | FK → plots.id (CASCADE)             |
| year               | INTEGER        | não  | eixo do gráfico histórico           |
| analysis_date      | DATE           | sim  | data da coleta                      |
| depth              | VARCHAR(30)    | sim  | ex.: "0-20cm"                       |
| lab_name           | VARCHAR(150)   | sim  |                                     |
| source_file        | VARCHAR(255)   | sim  | planilha de origem da importação    |
| ph                 | DECIMAL(5,2)   | sim  |                                     |
| organic_matter     | DECIMAL(10,2)  | sim  | matéria orgânica                    |
| base_saturation    | DECIMAL(10,2)  | sim  | saturação por bases (V%)            |
| cec                | DECIMAL(10,2)  | sim  | CTC                                 |
| aluminum_saturation| DECIMAL(10,2)  | sim  | saturação por alumínio (m%)         |
| phosphorus         | DECIMAL(10,2)  | sim  | P                                   |
| potassium          | DECIMAL(10,2)  | sim  | K                                   |
| calcium            | DECIMAL(10,2)  | sim  | Ca                                  |
| magnesium          | DECIMAL(10,2)  | sim  | Mg                                  |
| sulfur             | DECIMAL(10,2)  | sim  | S                                   |
| zinc               | DECIMAL(10,2)  | sim  | Zn                                  |
| manganese          | DECIMAL(10,2)  | sim  | Mn                                  |
| iron               | DECIMAL(10,2)  | sim  | Fe                                  |
| copper             | DECIMAL(10,2)  | sim  | Cu                                  |
| boron              | DECIMAL(10,2)  | sim  | B                                   |

Cobertura dos gráficos: barras (Ca, Mg, K, P, S, matéria orgânica, saturação);
radar (P, Zn, Mn, Fe, Cu, B, Mg, Ca, S, K).
Índices: `soil_analyses_plot_id_idx`, `soil_analyses_plot_id_year_idx`.

## seasons
Safra por talhão (módulo SAFRAS).

| Coluna       | Tipo          | Nulo | Notas                                   |
|--------------|---------------|------|-----------------------------------------|
| id           | UUID          | não  | PK                                      |
| plot_id      | UUID          | não  | FK → plots.id (CASCADE)                 |
| crop         | ENUM          | não  | `soja` \| `milho`                       |
| variety      | VARCHAR(150)  | não  | ex.: "Ares 7200"                        |
| season_label | VARCHAR(20)   | sim  | ex.: "2023/2024"                        |
| year         | INTEGER       | não  |                                         |
| start_date   | DATE          | sim  | plantio                                 |
| end_date     | DATE          | sim  | colheita                                |
| marker_lat   | DECIMAL(10,7) | sim  | marcador no mapa (fallback: centroide)  |
| marker_lng   | DECIMAL(10,7) | sim  |                                         |

Índices: `seasons_plot_id_idx`, `seasons_plot_id_year_idx`.

## season_events
Eventos da linha do tempo de uma safra.

| Coluna      | Tipo         | Nulo | Notas                                                                  |
|-------------|--------------|------|------------------------------------------------------------------------|
| id          | UUID         | não  | PK                                                                     |
| season_id   | UUID         | não  | FK → seasons.id (CASCADE)                                             |
| event_type  | ENUM         | não  | `plantio`\|`adubacao`\|`aplicacao_defensivos`\|`irrigacao`\|`colheita`\|`outro` |
| title       | VARCHAR(150) | não  |                                                                       |
| description | TEXT         | sim  | exibida no pop-up                                                     |
| event_date  | DATE         | não  | ordena a timeline                                                    |

Índices: `season_events_season_id_idx`, `season_events_season_id_event_date_idx`.

## event_photos
Fotos anexadas a um evento.

| Coluna    | Tipo          | Nulo | Notas                              |
|-----------|---------------|------|------------------------------------|
| id        | UUID          | não  | PK                                 |
| event_id  | UUID          | não  | FK → season_events.id (CASCADE)    |
| url       | VARCHAR(512)  | não  | caminho/URL no storage             |
| caption   | VARCHAR(255)  | sim  |                                    |
| file_name | VARCHAR(255)  | sim  |                                    |
| file_size | INTEGER       | sim  | bytes                              |
| mime_type | VARCHAR(100)  | sim  |                                    |

Índice: `event_photos_event_id_idx`.
