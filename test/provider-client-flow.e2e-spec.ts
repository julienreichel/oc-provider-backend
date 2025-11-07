import { INestApplication } from '@nestjs/common';
import {
  createApp,
  createRequest,
  resetDb,
  teardownHarness,
} from './e2e/harness';

describe('Provider -> Client Integration (e2e)', () => {
  let app: INestApplication | null = null;
  let request: ReturnType<typeof createRequest>;
  let canRun = false;

  beforeAll(async () => {
    app = await createApp({ mockClientGateway: false });
    request = createRequest(app);

    try {
      const readyResponse = await request.get('/api/ready');
      canRun =
        readyResponse.status === 200 &&
        readyResponse.body?.status === 'ready' &&
        readyResponse.body?.database === 'connected';
      if (!canRun) {
        console.warn(
          'Skipping provider -> client integration E2E: ready endpoint not reporting database connected',
        );
      }
    } catch (error) {
      canRun = false;
      console.warn(
        'Skipping provider -> client integration E2E: ready check failed',
        error,
      );
    }
  });

  afterEach(async () => {
    if (app && canRun) {
      await resetDb(app);
    }
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    await teardownHarness();
  });

  const skipIfNeeded = () => {
    if (!canRun) {
      pending(
        'Client integration E2E skipped because /api/ready is not reporting database connected.',
      );
      return true;
    }
    return false;
  };

  it('stores the document in the client backend when ready', async () => {
    if (skipIfNeeded()) {
      return;
    }

    const createResponse = await request
      .post('/api/documents')
      .send({ title: 'Client flow', content: 'Content from provider' })
      .expect(201);

    await request
      .put(`/api/documents/${createResponse.body.id}`)
      .send({ status: 'final' })
      .expect(200);

    const sendResponse = await request
      .post('/api/send')
      .send({ documentId: createResponse.body.id })
      .expect(200);

    expect(typeof sendResponse.body.accessCode).toBe('string');
    expect(sendResponse.body.accessCode.length).toBeGreaterThan(0);
  });
});
