import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DocumentRepository as MemoryDocumentRepository } from '../../src/infrastructure/repositories/memory/document';
import { PrismaService } from '../../src/infrastructure/services/prisma.service';
import type { ClientGateway } from '../../src/application/ports/client-gateway';

const usePrismaAdapter = process.env.E2E_MODE === 'prisma';

let moduleRef: TestingModule | null = null;
let memoryRepository: MemoryDocumentRepository | null = null;
let prismaService: PrismaService | null = null;
let clientGatewayMock: jest.Mocked<ClientGateway> | null = null;

export async function createApp(): Promise<INestApplication> {
  if (!moduleRef) {
    memoryRepository = usePrismaAdapter ? null : new MemoryDocumentRepository();
    clientGatewayMock = {
      sendDocument: jest
        .fn()
        .mockResolvedValue({ accessCode: 'mock-access-code' }),
    };

    const builder = Test.createTestingModule({
      imports: [AppModule],
    });

    if (!usePrismaAdapter && memoryRepository) {
      builder.overrideProvider('DocumentRepository').useValue(memoryRepository);
    }

    builder.overrideProvider('ClientGateway').useValue(clientGatewayMock);

    moduleRef = await builder.compile();

    if (usePrismaAdapter) {
      prismaService = moduleRef.get(PrismaService);
    }
  }

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.init();
  return app;
}

export function createRequest(app: INestApplication) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return request(app.getHttpServer());
}

export async function resetAppState(): Promise<void> {
  if (clientGatewayMock) {
    clientGatewayMock.sendDocument.mockReset();
    clientGatewayMock.sendDocument.mockResolvedValue({
      accessCode: 'mock-access-code',
    });
  }

  if (usePrismaAdapter) {
    if (!prismaService && moduleRef) {
      prismaService = moduleRef.get(PrismaService);
    }
    if (!prismaService) {
      throw new Error('PrismaService is not available for e2e tests');
    }

    await prismaService.$executeRawUnsafe(
      'TRUNCATE TABLE "documents" RESTART IDENTITY CASCADE',
    );
    return;
  }

  memoryRepository?.clear();
}

export function getClientGatewayMock(): jest.Mocked<ClientGateway> {
  if (!clientGatewayMock) {
    throw new Error('Client gateway mock not initialized');
  }
  return clientGatewayMock;
}

export async function teardownHarness(): Promise<void> {
  if (prismaService) {
    await prismaService.$disconnect();
    prismaService = null;
  }

  if (moduleRef) {
    await moduleRef.close();
    moduleRef = null;
  }

  memoryRepository = null;
  clientGatewayMock = null;
}
