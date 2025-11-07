import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DocumentController } from './document.controller';
import { CreateDocumentUseCase } from '../../application/use-cases/create-document';
import { GetDocumentUseCase } from '../../application/use-cases/get-document';
import { UpdateDocumentUseCase } from '../../application/use-cases/update-document';
import { ListDocumentsUseCase } from '../../application/use-cases/list-documents';
import { DocumentOutput } from '../../application/use-cases/document-output';
import { NotFoundError } from '../../domain/errors/errors';

describe('DocumentController (HTTP)', () => {
  let app: INestApplication;
  let createDocumentUseCase: { execute: jest.Mock };
  let getDocumentUseCase: { execute: jest.Mock };
  let updateDocumentUseCase: { execute: jest.Mock };
  let listDocumentsUseCase: { execute: jest.Mock };

  const sampleDocument: DocumentOutput = {
    id: 'doc-1',
    title: 'Title',
    content: 'Content',
    status: 'draft',
    accessCode: null,
    createdAt: new Date('2025-01-01T10:00:00Z'),
  };

  beforeEach(async () => {
    createDocumentUseCase = { execute: jest.fn() };
    getDocumentUseCase = { execute: jest.fn() };
    updateDocumentUseCase = { execute: jest.fn() };
    listDocumentsUseCase = { execute: jest.fn() };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        { provide: CreateDocumentUseCase, useValue: createDocumentUseCase },
        { provide: GetDocumentUseCase, useValue: getDocumentUseCase },
        { provide: UpdateDocumentUseCase, useValue: updateDocumentUseCase },
        { provide: ListDocumentsUseCase, useValue: listDocumentsUseCase },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /documents returns 201 with id', async () => {
    createDocumentUseCase.execute.mockResolvedValue({ id: 'doc-123' });

    const response = await request(app.getHttpServer())
      .post('/documents')
      .send({ title: 'Doc', content: 'Content' })
      .expect(201);

    expect(response.body).toEqual({ id: 'doc-123' });
  });

  it('POST /documents validates payload', async () => {
    await request(app.getHttpServer())
      .post('/documents')
      .send({ title: '', content: '' })
      .expect(400);
  });

  it('PUT /documents/:id updates document', async () => {
    updateDocumentUseCase.execute.mockResolvedValue({
      ...sampleDocument,
      title: 'Updated',
    });

    const response = await request(app.getHttpServer())
      .put('/documents/doc-1')
      .send({ title: 'Updated' })
      .expect(200);

    expect(response.body.title).toBe('Updated');
  });

  it('PUT /documents/:id returns 404 when not found', async () => {
    updateDocumentUseCase.execute.mockRejectedValue(
      new NotFoundError('missing'),
    );

    await request(app.getHttpServer())
      .put('/documents/doc-1')
      .send({ title: 'Updated' })
      .expect(404);
  });

  it('PUT /documents/:id validates payload', async () => {
    await request(app.getHttpServer())
      .put('/documents/doc-1')
      .send({ title: '' })
      .expect(400);
  });

  it('GET /documents/:id returns document', async () => {
    getDocumentUseCase.execute.mockResolvedValue(sampleDocument);

    const response = await request(app.getHttpServer())
      .get('/documents/doc-1')
      .expect(200);

    expect(response.body.id).toBe('doc-1');
  });

  it('GET /documents/:id returns 404 when missing', async () => {
    getDocumentUseCase.execute.mockRejectedValue(new NotFoundError('missing'));

    await request(app.getHttpServer()).get('/documents/doc-1').expect(404);
  });

  it('GET /documents lists paginated results', async () => {
    listDocumentsUseCase.execute.mockResolvedValue({
      items: [sampleDocument],
      nextCursor: 'cursor-123',
    });

    const response = await request(app.getHttpServer())
      .get('/documents')
      .query({ limit: 10 })
      .expect(200);

    expect(response.body.items).toHaveLength(1);
    expect(response.body.nextCursor).toBe('cursor-123');
    expect(listDocumentsUseCase.execute).toHaveBeenCalledWith({
      cursor: undefined,
      limit: 10,
    });
  });
});
