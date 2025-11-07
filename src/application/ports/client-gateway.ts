export interface ClientDocumentPayload {
  id: string;
  title: string;
  content: string;
}

export interface ClientDocumentResponse {
  accessCode: string;
}

export interface ClientGateway {
  sendDocument(payload: ClientDocumentPayload): Promise<ClientDocumentResponse>;
}
