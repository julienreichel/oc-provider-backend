export interface CreateDocumentRequest {
  title: string;
  content: string;
  providerId: string;
}

export interface UpdateDocumentRequest {
  id: string;
  title?: string;
  content?: string;
}

export interface DocumentResponse {
  id: string;
  title: string;
  content: string;
  providerId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransferDocumentRequest {
  documentId: string;
}

export interface TransferDocumentResponse {
  accessCode: string;
}
