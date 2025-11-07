import { Document } from '../../domain/entities/document';
import { DocumentRepository } from '../../domain/entities/repositories/document-repository';
import {
  InvalidDocumentStateError,
  NotFoundError,
} from '../../domain/errors/errors';
import { ClientGateway } from '../ports/client-gateway';
import { SendDocumentUseCase } from './send-document';

describe('SendDocumentUseCase', () => {
  let documentRepository: jest.Mocked<DocumentRepository>;
  let clientGateway: jest.Mocked<ClientGateway>;
  let useCase: SendDocumentUseCase;
  let document: Document;

  beforeEach(() => {
    documentRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findPaginated: jest.fn(),
    } as unknown as jest.Mocked<DocumentRepository>;

    clientGateway = {
      sendDocument: jest.fn(),
    };

    useCase = new SendDocumentUseCase(documentRepository, clientGateway);

    document = new Document(
      'doc-1',
      'Title',
      'Content',
      new Date('2025-01-01T10:00:00Z'),
      'final',
    );
  });

  it('sends document and persists access code', async () => {
    documentRepository.findById.mockResolvedValue(document);
    clientGateway.sendDocument.mockResolvedValue({ accessCode: 'ACC-123' });
    documentRepository.save.mockResolvedValue(document);

    const result = await useCase.execute({ documentId: 'doc-1' });

    expect(clientGateway.sendDocument).toHaveBeenCalledWith({
      id: 'doc-1',
      title: 'Title',
      content: 'Content',
    });
    expect(documentRepository.save).toHaveBeenCalled();
    expect(result.accessCode).toBe('ACC-123');
  });

  it('throws when document not found', async () => {
    documentRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ documentId: 'missing' })).rejects.toThrow(
      NotFoundError,
    );
  });

  it('throws when document is not finalized', async () => {
    documentRepository.findById.mockResolvedValue(
      new Document(
        'doc-1',
        'Title',
        'Content',
        new Date('2025-01-01T10:00:00Z'),
        'draft',
      ),
    );

    await expect(useCase.execute({ documentId: 'doc-1' })).rejects.toThrow(
      InvalidDocumentStateError,
    );
  });

  it('throws when document already has access code', async () => {
    const docWithCode = new Document(
      'doc-1',
      'Title',
      'Content',
      new Date('2025-01-01T10:00:00Z'),
      'final',
      'CODE-123',
    );
    documentRepository.findById.mockResolvedValue(docWithCode);

    await expect(useCase.execute({ documentId: 'doc-1' })).rejects.toThrow(
      InvalidDocumentStateError,
    );
  });

  it('propagates errors from gateway', async () => {
    documentRepository.findById.mockResolvedValue(document);
    const gatewayError = new Error('upstream');
    clientGateway.sendDocument.mockRejectedValue(gatewayError);

    await expect(useCase.execute({ documentId: 'doc-1' })).rejects.toThrow(
      'upstream',
    );
  });
});
