import {
  DocumentRepository,
  ListDocumentsParams,
} from '../../domain/entities/repositories/document-repository';
import { DocumentOutput, mapDocumentToOutput } from './document-output';

export interface ListDocumentsInput {
  cursor?: string;
  limit?: number;
}

export interface ListDocumentsOutput {
  items: DocumentOutput[];
  nextCursor?: string;
}

export class ListDocumentsUseCase {
  private static readonly DEFAULT_LIMIT = 20;
  private static readonly MAX_LIMIT = 50;
  private static readonly MIN_LIMIT = 1;

  constructor(private readonly documentRepository: DocumentRepository) {}

  async execute(input: ListDocumentsInput): Promise<ListDocumentsOutput> {
    const limit = this.normalizeLimit(input.limit);
    const params: ListDocumentsParams = {
      cursor: input.cursor,
      limit,
    };

    const result = await this.documentRepository.findPaginated(params);

    return {
      items: result.items.map(mapDocumentToOutput),
      nextCursor: result.nextCursor,
    };
  }

  private normalizeLimit(limit?: number): number {
    if (!limit) {
      return ListDocumentsUseCase.DEFAULT_LIMIT;
    }

    if (limit < ListDocumentsUseCase.MIN_LIMIT) {
      return ListDocumentsUseCase.MIN_LIMIT;
    }

    if (limit > ListDocumentsUseCase.MAX_LIMIT) {
      return ListDocumentsUseCase.MAX_LIMIT;
    }

    return Math.floor(limit);
  }
}
