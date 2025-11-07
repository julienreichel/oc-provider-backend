import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { HealthController } from './adapters/http/health.controller';
import { DocumentController } from './adapters/http/document.controller';
import { PersistenceModule } from './infrastructure/persistence.module';
import { ServicesModule } from './infrastructure/services.module';
import { ConfigModule } from './config/config.module';
import { CreateDocumentUseCase } from './application/use-cases/create-document';
import { GetDocumentUseCase } from './application/use-cases/get-document';
import { UpdateDocumentUseCase } from './application/use-cases/update-document';
import { ListDocumentsUseCase } from './application/use-cases/list-documents';
import type { DocumentRepository } from './domain/entities/repositories/document-repository';
import type { Clock } from './domain/services/clock';
import type { IdGenerator } from './domain/services/id-generator';

@Module({
  imports: [ConfigModule, PersistenceModule, ServicesModule],
  controllers: [HealthController, DocumentController],
  providers: [
    AppService,
    {
      provide: CreateDocumentUseCase,
      useFactory: (
        documentRepository: DocumentRepository,
        clock: Clock,
        idGenerator: IdGenerator,
      ) => new CreateDocumentUseCase(documentRepository, clock, idGenerator),
      inject: ['DocumentRepository', 'Clock', 'IdGenerator'],
    },
    {
      provide: GetDocumentUseCase,
      useFactory: (documentRepository: DocumentRepository) =>
        new GetDocumentUseCase(documentRepository),
      inject: ['DocumentRepository'],
    },
    {
      provide: UpdateDocumentUseCase,
      useFactory: (documentRepository: DocumentRepository) =>
        new UpdateDocumentUseCase(documentRepository),
      inject: ['DocumentRepository'],
    },
    {
      provide: ListDocumentsUseCase,
      useFactory: (documentRepository: DocumentRepository) =>
        new ListDocumentsUseCase(documentRepository),
      inject: ['DocumentRepository'],
    },
  ],
})
export class AppModule {}
