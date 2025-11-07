import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
} from '@nestjs/common';
import { SendDocumentUseCase } from '../../application/use-cases/send-document';
import { SendDocumentDto } from './dtos/send-document.dto';
import { DomainExceptionFilter } from './filters/domain-exception.filter';

export interface SendDocumentResponse {
  accessCode: string;
}

@Controller('send')
@UseFilters(DomainExceptionFilter)
export class SendController {
  constructor(private readonly sendDocumentUseCase: SendDocumentUseCase) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async send(@Body() payload: SendDocumentDto): Promise<SendDocumentResponse> {
    const result = await this.sendDocumentUseCase.execute({
      documentId: payload.documentId,
    });

    return {
      accessCode: result.accessCode,
    };
  }
}
