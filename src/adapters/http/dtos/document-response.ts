import { DocumentStatus } from '../../../domain/entities/document';

export interface DocumentResponse {
  id: string;
  title: string;
  content: string;
  status: DocumentStatus;
  accessCode: string | null;
  createdAt: string;
}

export interface ListDocumentsResponse {
  items: DocumentResponse[];
  nextCursor?: string;
}
