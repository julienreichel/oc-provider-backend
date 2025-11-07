import { Document } from '../../domain/entities/document';
import { DocumentRepository } from '../../domain/entities/repositories/document-repository';
import { NotFoundError } from '../../domain/errors/errors';
import { GetDocumentUseCase } from './get-document';

describe('GetDocumentUseCase', () => {
  const baseDocument = new Document(
    'doc-1',
    'Title',
    'Content',
    new Date('2025-01-01T10:00:00Z'),
  );

  let documentRepository: jest.Mocked<DocumentRepository>;
  let useCase: GetDocumentUseCase;

  beforeEach(() => {
    documentRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findPaginated: jest.fn(),
    } as unknown as jest.Mocked<DocumentRepository>;

    useCase = new GetDocumentUseCase(documentRepository);
  });

  it('returns document when found', async () => {
    documentRepository.findById.mockResolvedValue(baseDocument);

    const result = await useCase.execute({ id: 'doc-1' });

    expect(result).toMatchObject({
      id: 'doc-1',
      title: 'Title',
      content: 'Content',
      status: 'draft',
    });
  });

  it('throws NotFoundError when document does not exist', async () => {
    documentRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'missing' })).rejects.toThrow(
      NotFoundError,
    );
  });
});
