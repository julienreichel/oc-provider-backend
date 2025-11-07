import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { HealthController } from './adapters/http/health.controller';
import { DocumentController } from './adapters/http/document.controller';
import { SendController } from './adapters/http/send.controller';
import { PersistenceModule } from './infrastructure/persistence.module';
import { ServicesModule } from './infrastructure/services.module';
import { GatewaysModule } from './infrastructure/gateways.module';
import { ConfigModule } from './config/config.module';
import { CreateDocumentUseCase } from './application/use-cases/create-document';
import { GetDocumentUseCase } from './application/use-cases/get-document';
import { UpdateDocumentUseCase } from './application/use-cases/update-document';
import { ListDocumentsUseCase } from './application/use-cases/list-documents';
import { SendDocumentUseCase } from './application/use-cases/send-document';
import type { DocumentRepository } from './domain/entities/repositories/document-repository';
import type { Clock } from './domain/services/clock';
import type { IdGenerator } from './domain/services/id-generator';
import type { ClientGateway } from './application/ports/client-gateway';

@Module({
  imports: [ConfigModule, PersistenceModule, ServicesModule, GatewaysModule],
  controllers: [HealthController, DocumentController, SendController],
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
    {
      provide: SendDocumentUseCase,
      useFactory: (
        documentRepository: DocumentRepository,
        clientGateway: ClientGateway,
      ) => new SendDocumentUseCase(documentRepository, clientGateway),
      inject: ['DocumentRepository', 'ClientGateway'],
    },
  ],
})
export class AppModule {}
