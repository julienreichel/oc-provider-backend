import { Injectable, Inject } from '@nestjs/common';
import {
  Document,
  DocumentStatus,
} from '../../domain/entities/document.entity';
import type { DocumentRepository } from '../../domain/repositories/document.repository';
import { DocumentDomainService } from '../../domain/services/document-domain.service';
import {
  CreateDocumentRequest,
  DocumentResponse,
} from '../ports/document.port';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateDocumentUseCase {
  constructor(
    @Inject('DocumentRepository')
    private readonly documentRepository: DocumentRepository,
    private readonly documentDomainService: DocumentDomainService,
  ) {}

  async execute(request: CreateDocumentRequest): Promise<DocumentResponse> {
    // Validate content using domain service
    this.documentDomainService.validateDocumentContent(request.content);

    // Create new document entity
    const document = new Document(
      uuidv4() as string,
      request.title,
      request.content,
      request.providerId,
      new Date(),
      new Date(),
      DocumentStatus.DRAFT,
    );

    // Save to repository
    const savedDocument = await this.documentRepository.save(document);

    // Return response
    return this.toResponse(savedDocument);
  }

  private toResponse(document: Document): DocumentResponse {
    return {
      id: document.id,
      title: document.title,
      content: document.content,
      providerId: document.providerId,
      status: document.status,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}
