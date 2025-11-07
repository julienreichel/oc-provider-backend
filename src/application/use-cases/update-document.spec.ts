import { Document } from '../../domain/entities/document';
import { DocumentRepository } from '../../domain/entities/repositories/document-repository';
import {
  InvalidDocumentStateError,
  NotFoundError,
} from '../../domain/errors/errors';
import { UpdateDocumentUseCase } from './update-document';

describe('UpdateDocumentUseCase', () => {
  let documentRepository: jest.Mocked<DocumentRepository>;
  let useCase: UpdateDocumentUseCase;
  let existingDocument: Document;

  beforeEach(() => {
    documentRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findPaginated: jest.fn(),
    } as unknown as jest.Mocked<DocumentRepository>;

    useCase = new UpdateDocumentUseCase(documentRepository);

    existingDocument = new Document(
      'doc-1',
      'Original Title',
      'Original Content',
      new Date('2025-01-01T10:00:00Z'),
    );
  });

  it('updates title and content', async () => {
    documentRepository.findById.mockResolvedValue(existingDocument);
    documentRepository.save.mockImplementation((doc) => Promise.resolve(doc));

    const result = await useCase.execute({
      id: 'doc-1',
      title: ' Updated Title ',
      content: ' Updated Content ',
    });

    expect(documentRepository.save).toHaveBeenCalled();
    expect(result.title).toBe('Updated Title');
    expect(result.content).toBe('Updated Content');
  });

  it('throws when document missing', async () => {
    documentRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 'missing', title: 'New' }),
    ).rejects.toThrow(NotFoundError);
  });

  it('allows status change to final with access code', async () => {
    documentRepository.findById.mockResolvedValue(existingDocument);
    documentRepository.save.mockImplementation((doc) => Promise.resolve(doc));

    const result = await useCase.execute({
      id: 'doc-1',
      status: 'final',
      accessCode: ' CODE-123 ',
    });

    expect(result.status).toBe('final');
    expect(result.accessCode).toBe('CODE-123');
  });

  it('allows status change to final without access code', async () => {
    documentRepository.findById.mockResolvedValue(existingDocument);
    documentRepository.save.mockImplementation((doc) => Promise.resolve(doc));

    const result = await useCase.execute({
      id: 'doc-1',
      status: 'final',
    });

    expect(result.status).toBe('final');
    expect(result.accessCode).toBeNull();
  });

  it('throws when providing access code while status is draft', async () => {
    documentRepository.findById.mockResolvedValue(existingDocument);

    await expect(
      useCase.execute({
        id: 'doc-1',
        status: 'draft',
        accessCode: 'CODE-123',
      }),
    ).rejects.toThrow(InvalidDocumentStateError);
  });
});
