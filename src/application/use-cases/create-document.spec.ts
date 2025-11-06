import { Document } from '../../domain/entities/document';
import { DocumentRepository } from '../../domain/entities/repositories/document-repository';
import { Clock } from '../../domain/services/clock';
import { IdGenerator } from '../../domain/services/id-generator';
import { DocumentRepository as DocumentRepositoryImpl } from '../../infrastructure/repositories/memory/document';
import { FakeClock } from '../../infrastructure/testing/fake-clock';
import { FakeIdGenerator } from '../../infrastructure/testing/fake-id-generator';
import { CreateDocumentUseCase } from './create-document';

describe('CreateDocumentUseCase', () => {
  let useCase: CreateDocumentUseCase;
  let documentRepository: DocumentRepository;
  let clock: Clock;
  let idGenerator: IdGenerator;

  beforeEach(() => {
    documentRepository = new DocumentRepositoryImpl();
    clock = new FakeClock();
    idGenerator = new FakeIdGenerator();

    useCase = new CreateDocumentUseCase(documentRepository, clock, idGenerator);
  });

  describe('Happy path', () => {
    it('should create document with no expiration', async () => {
      // Given
      const input = {
        title: 'Test Document',
        content: 'This is test content',
      };

      // When
      await useCase.execute(input);

      // Verify document was persisted
      const documents = await documentRepository.findAll();
      expect(documents).toHaveLength(1);
      expect(documents[0].title).toBe('Test Document');
      expect(documents[0].content).toBe('This is test content');
    });
  });

  describe('Validation', () => {
    it('should throw error for empty title', async () => {
      // Given
      const input = {
        title: '',
        content: 'Valid content',
      };

      // When & Then
      await expect(useCase.execute(input)).rejects.toThrow(
        'Title cannot be empty',
      );
    });

    it('should throw error for whitespace-only title', async () => {
      // Given
      const input = {
        title: '   ',
        content: 'Valid content',
      };

      // When & Then
      await expect(useCase.execute(input)).rejects.toThrow(
        'Title cannot be empty',
      );
    });

    it('should throw error for empty content', async () => {
      // Given
      const input = {
        title: 'Valid title',
        content: '',
      };

      // When & Then
      await expect(useCase.execute(input)).rejects.toThrow(
        'Content cannot be empty',
      );
    });

    it('should throw error for whitespace-only content', async () => {
      // Given
      const input = {
        title: 'Valid title',
        content: '   \n\t  ',
      };

      // When & Then
      await expect(useCase.execute(input)).rejects.toThrow(
        'Content cannot be empty',
      );
    });

    it('should throw error for negative expiration time', async () => {
      // Given
      const input = {
        title: 'Valid title',
        content: 'Valid content',
        expiresIn: -3600,
      };

      // When & Then
      await expect(useCase.execute(input)).rejects.toThrow(
        'Expiration time must be positive',
      );
    });

    it('should throw error for zero expiration time', async () => {
      // Given
      const input = {
        title: 'Valid title',
        content: 'Valid content',
        expiresIn: 0,
      };

      // When & Then
      await expect(useCase.execute(input)).rejects.toThrow(
        'Expiration time must be positive',
      );
    });
  });

  describe('Edge cases', () => {
    it('should trim whitespace from title and content', async () => {
      // Given
      const input = {
        title: '  Test Document  ',
        content: '  This is test content  ',
      };

      // When
      await useCase.execute(input);

      // Then
      const documents = await documentRepository.findAll();
      expect(documents[0].title).toBe('Test Document');
      expect(documents[0].content).toBe('This is test content');
    });
  });
});
