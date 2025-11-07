import { Document, DocumentStatus } from '../../domain/entities/document';
import { DocumentRepository } from '../../domain/entities/repositories/document-repository';
import {
  InvalidDocumentStateError,
  NotFoundError,
} from '../../domain/errors/errors';
import { DocumentOutput, mapDocumentToOutput } from './document-output';

export interface UpdateDocumentInput {
  id: string;
  title?: string;
  content?: string;
  status?: DocumentStatus;
  accessCode?: string | null;
}

export class UpdateDocumentUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  async execute(input: UpdateDocumentInput): Promise<DocumentOutput> {
    const document = await this.documentRepository.findById(input.id);

    if (!document) {
      throw new NotFoundError(`Document ${input.id} not found`);
    }

    const nextTitle = input.title?.trim() ?? document.title;
    const nextContent = input.content?.trim() ?? document.content;

    this.validateField('Title', input.title);
    this.validateField('Content', input.content);

    const nextStatus = input.status ?? document.status;
    let nextAccessCode =
      input.accessCode !== undefined ? input.accessCode : document.accessCode;

    if (typeof nextAccessCode === 'string') {
      nextAccessCode = nextAccessCode.trim();
    }

    if (nextAccessCode && nextStatus !== 'final') {
      throw new InvalidDocumentStateError(
        'Access code can only be set when document is final',
      );
    }

    if (typeof nextAccessCode === 'string' && nextAccessCode === '') {
      throw new InvalidDocumentStateError('Access code cannot be empty');
    }

    if (nextStatus !== 'final') {
      nextAccessCode = null;
    }

    const updatedDocument = new Document(
      document.id,
      nextTitle,
      nextContent,
      document.createdAt,
      nextStatus,
      nextAccessCode,
    );

    await this.documentRepository.save(updatedDocument);

    return mapDocumentToOutput(updatedDocument);
  }

  private validateField(field: 'Title' | 'Content', value?: string): void {
    if (value === undefined) {
      return;
    }

    if (value.trim() === '') {
      throw new InvalidDocumentStateError(`${field} cannot be empty`);
    }
  }
}
