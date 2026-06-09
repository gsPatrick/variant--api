# Middlewares — variant-api

Middlewares transversais em `src/middlewares/`.

## `authenticate`
Valida o header `Authorization: Bearer <jwt>`, verifica o token (`utils/jwt`),
carrega o usuário e popula `req.user = { id, role, name, email }`. Em falha,
encaminha `401 UNAUTHENTICATED` ao error-handler.

```js
const authenticate = require('../../middlewares/authenticate');
router.use(authenticate);
```

## `authorize(...roles)`
Restringe o acesso por perfil. Deve vir **depois** de `authenticate`.
`403 FORBIDDEN` se o `req.user.role` não estiver na lista.

```js
const authorize = require('../../middlewares/authorize');
const { USER_ROLES } = require('../../config/constants');
router.use(authenticate, authorize(USER_ROLES.ADMIN));
```

## `tenant-access` (multi-tenancy)
`resolvePlotAccess` / `resolveSeasonAccess` carregam o recurso (talhão / safra
→ fazenda), aplicam o filtro de tenant e anexam `req.plot` / `req.season`.
Admin vê tudo; produtor só os recursos das suas fazendas (`403 FORBIDDEN`),
`404` se o recurso não existir. Usar após `authenticate`.

```js
const { resolvePlotAccess } = require('../../middlewares/tenant-access');
router.get('/:plotId/map', resolvePlotAccess, controller.mapData);
```

## `upload` (multer)
- `memoryUpload(field, { allowedExt })` — buffer em memória (planilhas, KML).
- `imageUpload(field, subdir)` — grava imagem em disco (`UPLOAD_DIR/<subdir>`).
Filtro de extensão e limite `MAX_UPLOAD_MB`. Erros viram `400 UPLOAD_ERROR`.

## `error-handler`
Middleware de erro único (registrado por último em `app.js`). Normaliza:
- `AppError` → `{ error: { code, message, [details] } }` com o `statusCode` dado;
- erros de validação/constraint do Sequelize → `400`/`409`;
- qualquer outro erro → `500 INTERNAL_ERROR` (loga o stack).
