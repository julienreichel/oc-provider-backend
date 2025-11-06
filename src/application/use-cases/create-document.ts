import { Document } from '../../domain/entities/document';
import type { DocumentRepository } from '../../domain/entities/repositories/document-repository';
import type { Clock } from '../../domain/services/clock';
import type { IdGenerator } from '../../domain/services/id-generator';

export interface CreateDocumentInput {
  title: string;
  content: string;
  expiresIn?: number; // seconds
}

export interface CreateDocumentOutput {
  id: string;
}

export class CreateDocumentUseCase {
  private static readonly MAX_RETRY_ATTEMPTS = 10;

  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly clock: Clock,
    private readonly idGenerator: IdGenerator,
  ) {}

  async execute(input: CreateDocumentInput): Promise<CreateDocumentOutput> {
    this.validateInput(input);

    const trimmedTitle = input.title.trim();
    const trimmedContent = input.content.trim();

    // Create and persist document
    const documentId = this.idGenerator.generate();
    const createdAt = this.clock.now();
    const document = new Document(
      documentId,
      trimmedTitle,
      trimmedContent,
      createdAt,
    );
    await this.documentRepository.save(document);

    return {
      id: documentId,
    };
  }

  private validateInput(input: CreateDocumentInput): void {
    if (!input.title || input.title.trim() === '') {
      throw new Error('Title cannot be empty');
    }

    if (!input.content || input.content.trim() === '') {
      throw new Error('Content cannot be empty');
    }

    if (input.expiresIn !== undefined && input.expiresIn <= 0) {
      throw new Error('Expiration time must be positive');
    }
  }
}
