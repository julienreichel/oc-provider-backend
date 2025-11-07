# E2E Harness

## Overview
The E2E harness can run in two modes:

| Mode | Description | Command |
| --- | --- | --- |
| In-memory (default) | Replaces the `DocumentRepository` with the in-memory adapter; mocks the ClientGateway. | `npm run test:e2e` |
| Prisma (DB-on) | Uses the real Prisma repository, truncating tables between tests. ClientGateway remains mocked. Requires a reachable Postgres defined in `DATABASE_URL`. | `E2E_MODE=prisma npm run test:e2e` |

Before running in Prisma mode, ensure:
1. `DATABASE_URL` points to a disposable database.
2. Migrations are applied: `npm run db:migrate`.
3. (Optional) You have a port-forward/Pod ready for CI (`scripts/db-port-forward.ts`).

## Harness API

```ts
import {
  createApp,
  createRequest,
  resetAppState,
  getClientGatewayMock,
  teardownHarness,
} from './e2e/harness';
```

- `createApp()` – boots Nest with production-like configuration.
- `createRequest(app)` – returns a Supertest instance.
- `resetAppState()` – clears the memory repository or truncates tables when `E2E_MODE=prisma`.
- `getClientGatewayMock()` – access the Jest mock to assert upstream calls.
- `teardownHarness()` – closes modules/clients after the suite.

Use them in your specs:

```ts
let app: INestApplication;
let request: ReturnType<typeof createRequest>;
let clientGatewayMock: ReturnType<typeof getClientGatewayMock>;

beforeAll(async () => {
  app = await createApp();
  request = createRequest(app);
  clientGatewayMock = getClientGatewayMock();
});

afterEach(async () => {
  await resetAppState();
});

afterAll(async () => {
  await app.close();
  await teardownHarness();
});
```
