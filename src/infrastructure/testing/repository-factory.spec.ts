import { Document } from '../../domain/entities/document';
import {
  RepositoryFactory,
  RepositoryType,
  TestRepositories,
} from './repository-factory';

describe('Repository Factory (Switching)', () => {
  // Only test PostgreSQL if DATABASE_URL is available
  const repositoryTypes: RepositoryType[] = ['memory'];

  if (process.env.DATABASE_URL) {
    repositoryTypes.push('postgresql');
  } else {
    console.warn(
      '⚠️  Skipping PostgreSQL repository tests: DATABASE_URL not set. Use npm run db:port-forward to connect to cluster DB.',
    );
  }

  repositoryTypes.forEach((repositoryType) => {
    describe(`Using ${repositoryType} repositories`, () => {
      let repositories: TestRepositories;

      beforeAll(async () => {
        repositories =
          await RepositoryFactory.createRepositories(repositoryType);
      });

      afterAll(async () => {
        if (repositories) {
          await repositories.cleanup();
        }
      });

      beforeEach(async () => {
        // Clear repositories before each test
        if (repositories.documentRepository.clear) {
          await repositories.documentRepository.clear();
        }
      });

      describe('Document Repository Tests', () => {
        it('should save and retrieve a document', async () => {
          // Given
          const document = new Document(
            'test-doc',
            'Test Title',
            'Test Content',
            new Date('2025-01-01T10:00:00.000Z'),
          );

          // When
          const saved = await repositories.documentRepository.save(document);
          const retrieved =
            await repositories.documentRepository.findById('test-doc');

          // Then
          expect(saved).toEqual(document);
          expect(retrieved).toEqual(document);
        });

        it('should return all documents', async () => {
          // Given
          const doc1 = new Document(
            'doc-1',
            'First',
            'Content 1',
            new Date('2025-01-01T09:00:00.000Z'),
          );
          const doc2 = new Document(
            'doc-2',
            'Second',
            'Content 2',
            new Date('2025-01-01T10:00:00.000Z'),
          );

          await repositories.documentRepository.save(doc1);
          await repositories.documentRepository.save(doc2);

          // When
          const all = await repositories.documentRepository.findAll();

          // Then
          expect(all).toHaveLength(2);
          expect(all.map((d) => d.id)).toContain('doc-1');
          expect(all.map((d) => d.id)).toContain('doc-2');
        });
      });
    });
  });
});
