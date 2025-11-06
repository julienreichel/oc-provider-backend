import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DocumentController } from './document.controller';
import { CreateDocumentUseCase } from '../../application/use-cases/create-document';
import { DocumentRepository as DocumentRepositoryImpl } from '../../infrastructure/repositories/memory/document';
import { FakeClock } from '../../infrastructure/testing/fake-clock';
import { FakeIdGenerator } from '../../infrastructure/testing/fake-id-generator';

describe('DocumentController', () => {
  let app: INestApplication;
  let documentRepository: DocumentRepositoryImpl;
  let fakeClock: FakeClock;
  let fakeIdGenerator: FakeIdGenerator;

  beforeEach(async () => {
    // Create fresh instances for each test
    documentRepository = new DocumentRepositoryImpl();
    fakeClock = new FakeClock();
    fakeIdGenerator = new FakeIdGenerator();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        {
          provide: CreateDocumentUseCase,
          useFactory: () =>
            new CreateDocumentUseCase(
              documentRepository,
              fakeClock,
              fakeIdGenerator,
            ),
        },
        // Provide the interfaces (not used directly, but needed for DI)
        { provide: 'DocumentRepository', useValue: documentRepository },
        { provide: 'Clock', useValue: fakeClock },
        { provide: 'IdGenerator', useValue: fakeIdGenerator },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Reset test utilities
    documentRepository.clear();
    fakeIdGenerator.reset();
    fakeClock.setTime(new Date('2025-01-01T10:00:00.000Z'));
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /documents', () => {
    it('should create document and return valid payload', async () => {
      // Given
      const validPayload = {
        title: 'Test Document',
        content: 'This is test content',
      };

      // When
      const response = await request(app.getHttpServer())
        .post('/documents')
        .send(validPayload)
        .expect(201);

      // Then
      expect(response.body).toEqual({
        id: 'test-id-001',
      });

      // Verify document was persisted
      const documents = await documentRepository.findAll();
      expect(documents).toHaveLength(1);
      expect(documents[0].title).toBe('Test Document');
      expect(documents[0].content).toBe('This is test content');
    });

    it('should create document with expiration and return', async () => {
      // Given
      const validPayload = {
        title: 'Expiring Document',
        content: 'Content with expiration',
        expiresIn: 3600, // 1 hour
      };

      // When
      const response = await request(app.getHttpServer())
        .post('/documents')
        .send(validPayload)
        .expect(201);

      // Then
      expect(response.body).toEqual({
        id: 'test-id-001',
      });
    });

    describe('Validation errors (400)', () => {
      it('should return 400 for missing title', async () => {
        // Given
        const invalidPayload = {
          content: 'Content without title',
        };

        // When
        const response = await request(app.getHttpServer())
          .post('/documents')
          .send(invalidPayload)
          .expect(400);

        // Then
        expect(response.body.message).toContain('title should not be empty');
      });

      it('should return 400 for empty title', async () => {
        // Given
        const invalidPayload = {
          title: '',
          content: 'Valid content',
        };

        // When
        const response = await request(app.getHttpServer())
          .post('/documents')
          .send(invalidPayload)
          .expect(400);

        // Then
        expect(response.body.message).toContain('title should not be empty');
      });

      it('should return 400 for missing content', async () => {
        // Given
        const invalidPayload = {
          title: 'Valid title',
        };

        // When
        const response = await request(app.getHttpServer())
          .post('/documents')
          .send(invalidPayload)
          .expect(400);

        // Then
        expect(response.body.message).toContain('content should not be empty');
      });

      it('should return 400 for empty content', async () => {
        // Given
        const invalidPayload = {
          title: 'Valid title',
          content: '',
        };

        // When
        const response = await request(app.getHttpServer())
          .post('/documents')
          .send(invalidPayload)
          .expect(400);

        // Then
        expect(response.body.message).toContain('content should not be empty');
      });
    });
  });
});
