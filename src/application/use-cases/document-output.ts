import { Document, DocumentStatus } from '../../domain/entities/document';

export interface DocumentOutput {
  id: string;
  title: string;
  content: string;
  status: DocumentStatus;
  accessCode: string | null;
  createdAt: Date;
}

export function mapDocumentToOutput(document: Document): DocumentOutput {
  return {
    id: document.id,
    title: document.title,
    content: document.content,
    status: document.status,
    accessCode: document.accessCode,
    createdAt: document.createdAt,
  };
}
