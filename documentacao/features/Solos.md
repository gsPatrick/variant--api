# Feature — SOLOS

Análises de solo por talhão: importação em lote e dados para os gráficos.
Pasta: `src/features/soils/` (`soils.routes/controller/service`,
`soils.constants.js`, `soil-spreadsheet.helper.js`).

Todas as rotas exigem autenticação. Leituras aplicam **multi-tenancy** via
`resolvePlotAccess`: produtor só acessa talhões das suas fazendas (senão `403`).

## Endpoints (prefixo `APP_API_PREFIX`, padrão `/api/v1`)

### POST `/plots/:plotId/soil-analyses/import` — **admin**
Importação de planilha (`.xlsx`, `.xls` ou `.csv`), `multipart/form-data`,
campo do arquivo: **`arquivo`**.

- Faz **upsert** por `(talhão, ano, profundidade)` em transação.
- Suporta **dois layouts**: (a) simples, 1 cabeçalho e 1 talhão; (b) **laudo de
  laboratório** com **2 linhas de cabeçalho** (nomes + unidades), **vários
  talhões no mesmo arquivo** (células de Talhão/Ano mescladas) e profundidades
  20/40. No layout multi-talhão, a importação filtra automaticamente as linhas
  do talhão selecionado (casando pelo nome); se nenhum casar, retorna `422
  PLOT_NOT_IN_FILE` listando os talhões do arquivo.
- Colunas reconhecidas (cabeçalho sem acento/maiúsculas, aceita variações):
  - `ano`/`safra` (**obrigatório**), `talhao`/`gleba` (multi-talhão), `prof`/`profundidade`,
    `data` (`dd/mm/aaaa` ou data do Excel), `laboratorio`
  - `ph`/`ph em água`, `ph cacl2`, `materia organica`/`mo`/`m.o`, `saturacao`/`v`,
    `ctc`/`ctc efetiva`, `saturacao aluminio`/`m`, `fosforo`/`p`, `potassio`/`k`,
    `calcio`/`ca`, `magnesio`/`mg`, `enxofre`/`s`, `zinco`/`zn`, `manganes`/`mn`,
    `ferro`/`fe`, `cobre`/`cu`, `boro`/`b`
- Decimais aceitam vírgula pt-BR (`3,5` → 3.5); células `"-"` são tratadas como
  ausentes (não geram erro). Colunas extras (textura, H+Al, COT, Al) são ignoradas.

Resposta `201`: `{ "data": { "totalLinhas": 12, "inseridos": 10, "atualizados": 2 }, "message": "Importacao concluida." }`

### GET `/plots/:plotId/soil-analyses/evolution?nutriente=calcio`
Gráfico de barras (evolução histórica). `nutriente` ∈ `ph, materia_organica,
saturacao, ctc, saturacao_aluminio, fosforo, potassio, calcio, magnesio, enxofre,
zinco, manganes, ferro, cobre, boro`.

Resposta `200`:
```json
{ "data": { "plotId": "uuid", "nutriente": "calcio",
  "series": [ { "year": 2022, "valor": 3.1 }, { "year": 2023, "valor": 3.5 } ] } }
```

### GET `/plots/:plotId/soil-analyses/radar?year=2024`
Gráfico de radar (teores do ano): P, Zn, Mn, Fe, Cu, B, Mg, Ca, S, K.

Resposta `200`:
```json
{ "data": { "plotId": "uuid", "year": 2024,
  "teores": [ { "nutriente": "fosforo", "valor": 12.5 }, { "nutriente": "zinco", "valor": 1.2 } ] } }
```

## Erros comuns

| HTTP | code                     | Quando                                            |
|------|--------------------------|---------------------------------------------------|
| 400  | `NO_FILE`                | Upload sem o campo `arquivo`.                     |
| 400  | `INVALID_NUTRIENT`       | `nutriente` fora da lista.                        |
| 400  | `INVALID_YEAR`           | `year` ausente/ inválido no radar.               |
| 403  | `FORBIDDEN`              | Produtor tentando talhão de terceiros.           |
| 404  | `PLOT_NOT_FOUND`         | Talhão inexistente.                              |
| 404  | `ANALYSIS_NOT_FOUND`     | Sem análise para o ano (radar).                  |
| 422  | `IMPORT_VALIDATION_ERROR`| Planilha com linhas inválidas (`details` lista). |
| 422  | `EMPTY_IMPORT`           | Nenhuma linha válida.                            |
