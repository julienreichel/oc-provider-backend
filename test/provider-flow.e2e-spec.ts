import { INestApplication } from '@nestjs/common';
import {
  createApp,
  createRequest,
  getClientGatewayMock,
  resetAppState,
  teardownHarness,
} from './e2e/harness';

describe('Provider Flow (e2e)', () => {
  let app: INestApplication;
  let request: ReturnType<typeof createRequest>;
  let clientGatewayMock: ReturnType<typeof getClientGatewayMock>;

  beforeAll(async () => {
    app = await createApp();
    request = createRequest(app);
    clientGatewayMock = getClientGatewayMock();
  });

  afterEach(async () => {
    await resetAppState(app);
  });

  afterAll(async () => {
    await app?.close();
    await teardownHarness();
  });

  describe('End-to-end document lifecycle', () => {
    it('creates, finalizes, and sends a document', async () => {
      const createResponse = await request
        .post('/api/documents')
        .send({ title: 'Draft doc', content: 'Initial content' })
        .expect(201);
      const documentId = createResponse.body.id as string;

      await request.get(`/api/documents/${documentId}`).expect(200);

      const updateResponse = await request
        .put(`/api/documents/${documentId}`)
        .send({ status: 'final', content: 'Final content' })
        .expect(200);
      expect(updateResponse.body.status).toBe('final');
      expect(updateResponse.body.accessCode).toBeNull();

      clientGatewayMock.sendDocument.mockResolvedValueOnce({
        accessCode: 'ACCESS-123',
      });

      const sendResponse = await request
        .post('/api/send')
        .send({ documentId })
        .expect(200);
      expect(sendResponse.body).toEqual({ accessCode: 'ACCESS-123' });
      expect(clientGatewayMock.sendDocument).toHaveBeenCalledWith({
        id: documentId,
        title: 'Draft doc',
        content: 'Final content',
      });

      const finalState = await request
        .get(`/api/documents/${documentId}`)
        .expect(200);
      expect(finalState.body.accessCode).toBe('ACCESS-123');
    });

    it('rejects sending a draft document', async () => {
      const createResponse = await request
        .post('/api/documents')
        .send({ title: 'Draft only', content: 'Content' })
        .expect(201);

      await request
        .post('/api/send')
        .send({ documentId: createResponse.body.id })
        .expect(400);

      expect(clientGatewayMock.sendDocument).not.toHaveBeenCalled();
    });
  });

  describe('Read operations', () => {
    it('supports list, update, and get', async () => {
      const first = await request
        .post('/api/documents')
        .send({ title: 'Doc A', content: 'A content' });
      const second = await request
        .post('/api/documents')
        .send({ title: 'Doc B', content: 'B content' });

      await request
        .put(`/api/documents/${first.body.id}`)
        .send({ status: 'final' })
        .expect(200);

      const listResponse = await request
        .get('/api/documents?limit=10')
        .expect(200);
      expect(Array.isArray(listResponse.body.items)).toBe(true);
      expect(listResponse.body.items.length).toBe(2);

      await request.get(`/api/documents/${second.body.id}`).expect(200);
    });

    it('returns 404 for unknown documents', async () => {
      await request.get('/api/documents/non-existent').expect(404);
      await request
        .put('/api/documents/non-existent')
        .send({ title: 'Updated' })
        .expect(404);
      await request
        .post('/api/send')
        .send({ documentId: 'non-existent' })
        .expect(404);
    });
  });
});
