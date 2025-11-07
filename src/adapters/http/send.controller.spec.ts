import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { SendDocumentUseCase } from '../../application/use-cases/send-document';
import { NotFoundError } from '../../domain/errors/errors';
import { SendController } from './send.controller';

describe('SendController', () => {
  let app: INestApplication;
  let sendDocumentUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    sendDocumentUseCase = {
      execute: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [SendController],
      providers: [
        {
          provide: SendDocumentUseCase,
          useValue: sendDocumentUseCase,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /send returns access code', async () => {
    sendDocumentUseCase.execute.mockResolvedValue({ accessCode: 'CODE-123' });

    const response = await request(app.getHttpServer())
      .post('/send')
      .send({ documentId: 'doc-1' })
      .expect(200);

    expect(response.body).toEqual({ accessCode: 'CODE-123' });
  });

  it('POST /send validates body', async () => {
    await request(app.getHttpServer()).post('/send').send({}).expect(400);
  });

  it('POST /send maps not found to 404', async () => {
    sendDocumentUseCase.execute.mockRejectedValue(
      new NotFoundError('not found'),
    );

    await request(app.getHttpServer())
      .post('/send')
      .send({ documentId: 'missing' })
      .expect(404);
  });
});
