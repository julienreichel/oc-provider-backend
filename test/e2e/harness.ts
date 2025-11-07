import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../../src/infrastructure/services/prisma.service';
import { AppModule } from '../../src/app.module';
import type { ClientGateway } from '../../src/application/ports/client-gateway';

type HarnessMode = 'mock-client' | 'real-client';

interface AppContext {
  moduleRef: TestingModule;
  prisma: PrismaService;
  clientGatewayMock?: jest.Mocked<ClientGateway>;
}

const appContexts = new WeakMap<INestApplication, AppContext>();
let lastClientGatewayMock: jest.Mocked<ClientGateway> | null = null;

export interface HarnessOptions {
  mockClientGateway?: boolean;
}

export async function createApp(
  options: HarnessOptions = {},
): Promise<INestApplication> {
  const mode: HarnessMode =
    options.mockClientGateway === false ? 'real-client' : 'mock-client';

  const moduleBuilder = Test.createTestingModule({
    imports: [AppModule],
  });

  let clientGatewayMock: jest.Mocked<ClientGateway> | undefined;

  if (mode === 'mock-client') {
    clientGatewayMock = {
      sendDocument: jest
        .fn()
        .mockResolvedValue({ accessCode: 'mock-access-code' }),
    };
    moduleBuilder.overrideProvider('ClientGateway').useValue(clientGatewayMock);
  }

  const moduleRef = await moduleBuilder.compile();
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

  const prisma = moduleRef.get<PrismaService>(PrismaService);
  appContexts.set(app, { moduleRef, prisma, clientGatewayMock });
  if (clientGatewayMock) {
    lastClientGatewayMock = clientGatewayMock;
  }

  return app;
}

export function createRequest(app: INestApplication) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return request(app.getHttpServer());
}

function getContext(app: INestApplication): AppContext {
  const ctx = appContexts.get(app);
  if (!ctx) {
    throw new Error('No harness context associated with provided app');
  }
  return ctx;
}

export async function resetDb(app: INestApplication): Promise<void> {
  const { prisma } = getContext(app);
  await prisma.$executeRaw`TRUNCATE TABLE documents RESTART IDENTITY CASCADE`;
}

export async function resetAppState(app: INestApplication): Promise<void> {
  const ctx = getContext(app);
  await resetDb(app);

  if (ctx.clientGatewayMock) {
    ctx.clientGatewayMock.sendDocument.mockReset();
    ctx.clientGatewayMock.sendDocument.mockResolvedValue({
      accessCode: 'mock-access-code',
    });
  }
}

export function getClientGatewayMock(): jest.Mocked<ClientGateway> {
  if (!lastClientGatewayMock) {
    throw new Error(
      'Client gateway mock is not available - ensure createApp() was called with mockClientGateway true',
    );
  }
  return lastClientGatewayMock;
}

export async function teardownHarness(): Promise<void> {
  await Promise.resolve();
  lastClientGatewayMock = null;
}
