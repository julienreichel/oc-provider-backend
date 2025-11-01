import { Document } from '../entities/document.entity';

export interface DocumentRepository {
  findById(id: string): Promise<Document | null>;
  findByProviderId(providerId: string): Promise<Document[]>;
  save(document: Document): Promise<Document>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Document[]>;
}
