# Feature — CADASTRO GUIADO (Onboarding)

Fluxo do administrador (agrônomo) para cadastrar **cliente → projeto → informações**
em uma única operação. Mapeamento no schema existente:

- **cliente** → `User` com `role = producer` (novo, ou existente via `id`)
- **projeto** → `Farm` (fazenda gerida para o cliente)
- **informações** → `Plot`(s) (talhões) — opcional

Pasta: `src/features/onboarding/` (`routes → controller → service`, com
`onboarding.validator.js` e `onboarding.constants.js`).

## Modos

| Modo                       | `mode`         | Comportamento                                                                 |
|----------------------------|----------------|-------------------------------------------------------------------------------|
| Confirmação (**padrão**)   | `confirmacao`  | Front mostra o modal passo-a-passo; chama `POST /onboarding/preview` (não grava) e só cria ao confirmar no final via `POST /onboarding`. |
| Automático                 | `automatico`   | Front chama `POST /onboarding` direto após analisar; cria de imediato.        |

> O backend cria tudo **na mesma transação**: se o projeto ou um talhão falhar,
> nada é persistido (nem o cliente novo).

## Autenticação

Ambos os endpoints exigem **Bearer token de um usuário `admin`**
(`authenticate` + `authorize('admin')`). Obtenha o token em `POST /auth/login`
(ver [Auth.md](./Auth.md)).

## Endpoints (prefixo `APP_API_PREFIX`, padrão `/api/v1`)

### POST `/onboarding/preview`
Valida e devolve o resumo do que será criado, **sem gravar**.

Resposta `200`:
```json
{
  "data": {
    "canCreate": true,
    "issues": [],
    "resumo": {
      "mode": "confirmacao",
      "cliente": { "tipo": "novo", "name": "João", "email": "joao@x.com", "document": null, "phone": null },
      "projeto": { "name": "Fazenda Boa Vista", "city": "Sorriso", "state": "MT", "totalAreaHa": 1200.5 },
      "informacoes": { "totalTalhoes": 1, "talhoes": [{ "name": "Talhão 1", "areaHa": 80.25 }] }
    }
  }
}
```
Quando há pendência resolvível (ex.: email já usado), `canCreate: false` e
`issues` lista os problemas (sem erro HTTP).

### POST `/onboarding`
Cria cliente + projeto + talhões atomicamente. Resposta `201`:
```json
{
  "data": {
    "mode": "automatico",
    "clienteCriado": true,
    "cliente": { "id": "uuid", "name": "João", "email": "joao@x.com", "role": "producer" },
    "projeto": { "id": "uuid", "producerId": "uuid", "name": "Fazenda Boa Vista", "...": "..." },
    "talhoes": [{ "id": "uuid", "farmId": "uuid", "name": "Talhão 1", "...": "..." }]
  },
  "message": "Cadastro criado com sucesso."
}
```

## Payload de exemplo

Cliente **novo**:
```json
{
  "mode": "confirmacao",
  "cliente": { "name": "João", "email": "joao@x.com", "password": "segredo123", "document": "123.456.789-00", "phone": "+55 66 99999-0000" },
  "projeto": { "name": "Fazenda Boa Vista", "city": "Sorriso", "state": "MT", "totalAreaHa": 1200.5 },
  "informacoes": { "plots": [{ "name": "Talhão 1", "areaHa": 80.25, "kmlFilename": "t1.kml", "centroidLat": -12.5455, "centroidLng": -55.7211 }] }
}
```

Cliente **existente** (só o `id`):
```json
{
  "mode": "automatico",
  "cliente": { "id": "0e8f...uuid" },
  "projeto": { "name": "Fazenda Nova" }
}
```

## Erros comuns

| HTTP | code                  | Quando                                                        |
|------|-----------------------|---------------------------------------------------------------|
| 400  | `VALIDATION_ERROR`    | Payload inválido (campos faltando/ tipos errados). `details` lista os campos. |
| 401  | `UNAUTHENTICATED`     | Token ausente/inválido/expirado.                              |
| 403  | `FORBIDDEN`           | Usuário autenticado não é `admin`.                            |
| 404  | `CLIENT_NOT_FOUND`    | `cliente.id` informado não existe.                            |
| 409  | `EMAIL_ALREADY_USED`  | Email do cliente novo já cadastrado.                          |
| 422  | `CLIENT_NOT_PRODUCER` | `cliente.id` aponta para um usuário que não é produtor.       |
