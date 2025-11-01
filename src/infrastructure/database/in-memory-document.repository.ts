import { Injectable } from '@nestjs/common';
import { Document } from '../../domain/entities/document.entity';
import type { DocumentRepository } from '../../domain/repositories/document.repository';

@Injectable()
export class InMemoryDocumentRepository implements DocumentRepository {
  private documents: Map<string, Document> = new Map();

  findById(id: string): Promise<Document | null> {
    return Promise.resolve(this.documents.get(id) || null);
  }

  findByProviderId(providerId: string): Promise<Document[]> {
    return Promise.resolve(
      Array.from(this.documents.values()).filter(
        (doc) => doc.providerId === providerId,
      ),
    );
  }

  save(document: Document): Promise<Document> {
    this.documents.set(document.id, document);
    return Promise.resolve(document);
  }

  delete(id: string): Promise<void> {
    this.documents.delete(id);
    return Promise.resolve();
  }

  findAll(): Promise<Document[]> {
    return Promise.resolve(Array.from(this.documents.values()));
  }
}
