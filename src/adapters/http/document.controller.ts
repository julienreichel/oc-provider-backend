import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseFilters,
} from '@nestjs/common';
import { CreateDocumentUseCase } from '../../application/use-cases/create-document';
import { GetDocumentUseCase } from '../../application/use-cases/get-document';
import { ListDocumentsUseCase } from '../../application/use-cases/list-documents';
import { UpdateDocumentUseCase } from '../../application/use-cases/update-document';
import { DocumentOutput } from '../../application/use-cases/document-output';
import { CreateDocument } from './dtos/create-document';
import { CreateDocumentResponse } from './dtos/create-document-response';
import {
  DocumentResponse,
  ListDocumentsResponse,
} from './dtos/document-response';
import { ListDocumentsQueryDto } from './dtos/list-documents-query.dto';
import { UpdateDocumentDto } from './dtos/update-document';
import { DomainExceptionFilter } from './filters/domain-exception.filter';

@Controller('documents')
@UseFilters(DomainExceptionFilter)
export class DocumentController {
  constructor(
    private readonly createDocumentUseCase: CreateDocumentUseCase,
    private readonly getDocumentUseCase: GetDocumentUseCase,
    private readonly updateDocumentUseCase: UpdateDocumentUseCase,
    private readonly listDocumentsUseCase: ListDocumentsUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDocument(
    @Body() createDocument: CreateDocument,
  ): Promise<CreateDocumentResponse> {
    const result = await this.createDocumentUseCase.execute({
      title: createDocument.title,
      content: createDocument.content,
    });

    return {
      id: result.id,
    };
  }

  @Get()
  async listDocuments(
    @Query() query: ListDocumentsQueryDto,
  ): Promise<ListDocumentsResponse> {
    const result = await this.listDocumentsUseCase.execute({
      cursor: query.cursor,
      limit: query.limit,
    });

    return {
      items: result.items.map((item) => this.toDocumentResponse(item)),
      nextCursor: result.nextCursor,
    };
  }

  @Get(':id')
  async getDocument(@Param('id') id: string): Promise<DocumentResponse> {
    const result = await this.getDocumentUseCase.execute({ id });
    return this.toDocumentResponse(result);
  }

  @Put(':id')
  async updateDocument(
    @Param('id') id: string,
    @Body() updateDto: UpdateDocumentDto,
  ): Promise<DocumentResponse> {
    const result = await this.updateDocumentUseCase.execute({
      id,
      title: updateDto.title,
      content: updateDto.content,
      status: updateDto.status,
      accessCode: updateDto.accessCode ?? undefined,
    });

    return this.toDocumentResponse(result);
  }

  private toDocumentResponse(document: DocumentOutput): DocumentResponse {
    return {
      id: document.id,
      title: document.title,
      content: document.content,
      status: document.status,
      accessCode: document.accessCode,
      createdAt: document.createdAt.toISOString(),
    };
  }
}
