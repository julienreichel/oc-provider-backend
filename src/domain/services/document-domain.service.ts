import { Injectable } from '@nestjs/common';
import { Document, DocumentStatus } from '../entities/document.entity';

@Injectable()
export class DocumentDomainService {
  validateDocumentContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new Error('Document content cannot be empty');
    }

    if (content.length > 10000) {
      throw new Error(
        'Document content exceeds maximum length of 10000 characters',
      );
    }
  }

  canPublishDocument(document: Document): boolean {
    return (
      document.status === DocumentStatus.DRAFT &&
      document.content.trim().length > 0 &&
      document.title.trim().length > 0
    );
  }

  generateAccessCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
