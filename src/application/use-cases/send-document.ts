import { DocumentRepository } from '../../domain/entities/repositories/document-repository';
import {
  InvalidDocumentStateError,
  NotFoundError,
} from '../../domain/errors/errors';
import { ClientGateway, ClientDocumentPayload } from '../ports/client-gateway';

export interface SendDocumentInput {
  documentId: string;
}

export interface SendDocumentOutput {
  accessCode: string;
}

export class SendDocumentUseCase {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly clientGateway: ClientGateway,
  ) {}

  async execute(input: SendDocumentInput): Promise<SendDocumentOutput> {
    const document = await this.documentRepository.findById(input.documentId);

    if (!document) {
      throw new NotFoundError(`Document ${input.documentId} not found`);
    }

    if (document.status !== 'final') {
      throw new InvalidDocumentStateError(
        'Document must be finalized before sending',
      );
    }

    if (!document.content || document.content.trim() === '') {
      throw new InvalidDocumentStateError('Document content cannot be empty');
    }

    if (document.accessCode) {
      throw new InvalidDocumentStateError(
        'Document already has an access code',
      );
    }

    const payload: ClientDocumentPayload = {
      id: document.id,
      title: document.title,
      content: document.content,
    };

    const response = await this.clientGateway.sendDocument(payload);

    document.assignAccessCode(response.accessCode);
    await this.documentRepository.save(document);

    return {
      accessCode: response.accessCode,
    };
  }
}
