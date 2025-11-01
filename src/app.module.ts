import { Module } from '@nestjs/common';
import { AppController } from './presentation/controllers/app.controller';
import { DocumentController } from './presentation/controllers/document.controller';
import { AppService } from './application/app.service';
import { CreateDocumentUseCase } from './application/use-cases/create-document.use-case';
import { TransferDocumentUseCase } from './application/use-cases/transfer-document.use-case';
import { DocumentDomainService } from './domain/services/document-domain.service';
import { InMemoryDocumentRepository } from './infrastructure/database/in-memory-document.repository';
import { ClientBackendService } from './infrastructure/http/client-backend.service';

@Module({
  imports: [],
  controllers: [AppController, DocumentController],
  providers: [
    // Application Services
    AppService,
    
    // Use Cases
    CreateDocumentUseCase,
    TransferDocumentUseCase,
    
    // Domain Services
    DocumentDomainService,
    
    // Infrastructure Services
    {
      provide: 'DocumentRepository',
      useClass: InMemoryDocumentRepository,
    },
    ClientBackendService,
  ],
})
export class AppModule {}
