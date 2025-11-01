import { Controller, Post, Param, Body } from '@nestjs/common';
import { CreateDocumentUseCase } from '../../application/use-cases/create-document.use-case';
import { TransferDocumentUseCase } from '../../application/use-cases/transfer-document.use-case';
import type {
  CreateDocumentRequest,
  DocumentResponse,
  TransferDocumentResponse,
} from '../../application/ports/document.port';

@Controller('api/documents')
export class DocumentController {
  constructor(
    private readonly createDocumentUseCase: CreateDocumentUseCase,
    private readonly transferDocumentUseCase: TransferDocumentUseCase,
  ) {}

  @Post()
  async createDocument(
    @Body() request: CreateDocumentRequest,
  ): Promise<DocumentResponse> {
    return this.createDocumentUseCase.execute(request);
  }

  @Post(':id/transfer')
  async transferDocument(
    @Param('id') documentId: string,
  ): Promise<TransferDocumentResponse> {
    return this.transferDocumentUseCase.execute({ documentId });
  }
}
