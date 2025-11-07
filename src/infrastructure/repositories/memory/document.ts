import { Document } from '../../../domain/entities/document';
import {
  DocumentRepository as DocumentRepositoryInterface,
  ListDocumentsParams,
  PaginatedDocuments,
} from '../../../domain/entities/repositories/document-repository';
import { decodeCursor, encodeCursor } from '../pagination-cursor';

export class DocumentRepository implements DocumentRepositoryInterface {
  private documents: Map<string, Document> = new Map();

  save(document: Document): Promise<Document> {
    this.documents.set(document.id, document);
    return Promise.resolve(document);
  }

  async findById(id: string): Promise<Document | null> {
    return Promise.resolve(this.documents.get(id) || null);
  }

  async findAll(): Promise<Document[]> {
    return Promise.resolve(Array.from(this.documents.values()));
  }

  findPaginated({
    cursor,
    limit,
  }: ListDocumentsParams): Promise<PaginatedDocuments> {
    const sorted = Array.from(this.documents.values()).sort((a, b) => {
      if (a.createdAt.getTime() !== b.createdAt.getTime()) {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      return b.id.localeCompare(a.id);
    });

    let filtered = sorted;
    if (cursor) {
      const payload = decodeCursor(cursor);
      filtered = sorted.filter(
        (doc) =>
          doc.createdAt.getTime() < payload.createdAt.getTime() ||
          (doc.createdAt.getTime() === payload.createdAt.getTime() &&
            doc.id < payload.id),
      );
    }

    const items = filtered.slice(0, limit);
    const hasNext = filtered.length > limit;
    const nextCursor = hasNext
      ? encodeCursor({
          id: filtered[limit].id,
          createdAt: filtered[limit].createdAt,
        })
      : undefined;

    return Promise.resolve({ items, nextCursor });
  }

  // Test helper methods
  clear(): void {
    this.documents.clear();
  }

  count(): number {
    return this.documents.size;
  }
}
