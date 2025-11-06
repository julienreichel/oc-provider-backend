import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import { CreateDocumentUseCase } from '../../application/use-cases/create-document';
import { CreateDocument } from './dtos/create-document';
import { CreateDocumentResponse } from './dtos/create-document-response';
import { DomainExceptionFilter } from './filters/domain-exception.filter';

@Controller('documents')
@UseFilters(DomainExceptionFilter)
export class DocumentController {
  constructor(private readonly CreateDocumentUseCase: CreateDocumentUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDocument(
    @Body() createDocument: CreateDocument,
  ): Promise<CreateDocumentResponse> {
    const result = await this.CreateDocumentUseCase.execute({
      title: createDocument.title,
      content: createDocument.content,
    });

    return {
      id: result.id,
    };
  }
}
