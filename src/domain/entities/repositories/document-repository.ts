import { Document } from '../document';

export interface ListDocumentsParams {
  cursor?: string;
  limit: number;
}

export interface PaginatedDocuments {
  items: Document[];
  nextCursor?: string;
}

export interface DocumentRepository {
  save(document: Document): Promise<Document>;
  findById(id: string): Promise<Document | null>;
  findAll(): Promise<Document[]>;
  findPaginated(params: ListDocumentsParams): Promise<PaginatedDocuments>;
}
