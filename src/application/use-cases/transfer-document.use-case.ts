import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { DocumentRepository } from '../../domain/repositories/document.repository';
import { DocumentDomainService } from '../../domain/services/document-domain.service';
import {
  TransferDocumentRequest,
  TransferDocumentResponse,
} from '../ports/document.port';

@Injectable()
export class TransferDocumentUseCase {
  constructor(
    @Inject('DocumentRepository')
    private readonly documentRepository: DocumentRepository,
    private readonly documentDomainService: DocumentDomainService,
  ) {}

  async execute(
    request: TransferDocumentRequest,
  ): Promise<TransferDocumentResponse> {
    // Find document
    const document = await this.documentRepository.findById(request.documentId);

    if (!document) {
      throw new NotFoundException(
        `Document with ID ${request.documentId} not found`,
      );
    }

    // Check if document can be published
    if (!this.documentDomainService.canPublishDocument(document)) {
      throw new Error(
        'Document cannot be transferred - it must be a draft with content and title',
      );
    }

    // Publish the document
    const publishedDocument = document.publish();
    await this.documentRepository.save(publishedDocument);

    // Generate access code (in real implementation, this would be sent to Client Backend)
    const accessCode = this.documentDomainService.generateAccessCode();

    // TODO: Send to Client Backend API
    // const clientResponse = await this.clientBackendService.sendDocument(publishedDocument);

    return {
      accessCode,
    };
  }
}
