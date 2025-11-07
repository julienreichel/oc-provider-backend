import { DocumentRepository } from '../../domain/entities/repositories/document-repository';
import { NotFoundError } from '../../domain/errors/errors';
import { DocumentOutput, mapDocumentToOutput } from './document-output';

export interface GetDocumentInput {
  id: string;
}

export class GetDocumentUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  async execute(input: GetDocumentInput): Promise<DocumentOutput> {
    const document = await this.documentRepository.findById(input.id);

    if (!document) {
      throw new NotFoundError(`Document ${input.id} not found`);
    }

    return mapDocumentToOutput(document);
  }
}
