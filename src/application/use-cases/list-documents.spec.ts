import { Document } from '../../domain/entities/document';
import {
  DocumentRepository,
  PaginatedDocuments,
} from '../../domain/entities/repositories/document-repository';
import { ListDocumentsUseCase } from './list-documents';

describe('ListDocumentsUseCase', () => {
  let documentRepository: jest.Mocked<DocumentRepository>;
  let useCase: ListDocumentsUseCase;

  beforeEach(() => {
    documentRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findPaginated: jest.fn(),
    } as unknown as jest.Mocked<DocumentRepository>;

    useCase = new ListDocumentsUseCase(documentRepository);
  });

  it('returns paginated documents', async () => {
    const documents: PaginatedDocuments = {
      items: [
        new Document(
          'doc-1',
          'Title 1',
          'Content 1',
          new Date('2025-01-01T10:00:00Z'),
        ),
      ],
      nextCursor: 'cursor-1',
    };

    documentRepository.findPaginated.mockResolvedValue(documents);

    const result = await useCase.execute({ limit: 10 });

    expect(documentRepository.findPaginated).toHaveBeenCalledWith({
      cursor: undefined,
      limit: 10,
    });
    expect(result.items).toHaveLength(1);
    expect(result.nextCursor).toBe('cursor-1');
  });

  it('applies default limit when not provided', async () => {
    documentRepository.findPaginated.mockResolvedValue({
      items: [],
      nextCursor: undefined,
    });

    await useCase.execute({});

    expect(documentRepository.findPaginated).toHaveBeenCalledWith({
      cursor: undefined,
      limit: 20,
    });
  });
});
