import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DocumentRepository as MemoryDocumentRepository } from '../../src/infrastructure/repositories/memory/document';
import type { ClientGateway } from '../../src/application/ports/client-gateway';

let moduleRef: TestingModule | null = null;
let documentRepository: MemoryDocumentRepository | null = null;
let clientGatewayMock: jest.Mocked<ClientGateway> | null = null;

export async function createApp(): Promise<INestApplication> {
  if (!moduleRef) {
    documentRepository = new MemoryDocumentRepository();
    clientGatewayMock = {
      sendDocument: jest
        .fn()
        .mockResolvedValue({ accessCode: 'mock-access-code' }),
    };

    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('DocumentRepository')
      .useValue(documentRepository)
      .overrideProvider('ClientGateway')
      .useValue(clientGatewayMock)
      .compile();
  }

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await app.init();
  return app;
}

export function createRequest(app: INestApplication) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return request(app.getHttpServer());
}

export function resetAppState(): void {
  documentRepository?.clear();
  if (clientGatewayMock) {
    clientGatewayMock.sendDocument.mockReset();
    clientGatewayMock.sendDocument.mockResolvedValue({
      accessCode: 'mock-access-code',
    });
  }
}

export function getDocumentRepository(): MemoryDocumentRepository {
  if (!documentRepository) {
    throw new Error('Document repository not initialized');
  }
  return documentRepository;
}

export function getClientGatewayMock(): jest.Mocked<ClientGateway> {
  if (!clientGatewayMock) {
    throw new Error('Client gateway mock not initialized');
  }
  return clientGatewayMock;
}

export async function teardownHarness(): Promise<void> {
  if (moduleRef) {
    await moduleRef.close();
    moduleRef = null;
  }
  documentRepository = null;
  clientGatewayMock = null;
}
