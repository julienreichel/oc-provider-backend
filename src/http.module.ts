import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentController } from './adapters/http/document.controller';
import { DomainExceptionFilter } from './adapters/http/filters/domain-exception.filter';
import { CreateDocumentUseCase } from './application/use-cases/create-document';

@Module({
  controllers: [DocumentController],
  providers: [
    // Global validation pipe
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
    // Use cases (dependencies will be injected when the module is configured)
    CreateDocumentUseCase,
  ],
})
export class HttpModule {}
