import { Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { PostgreSQLDocumentRepository } from './repositories/postgresql/document';

@Module({
  providers: [
    PrismaService,
    {
      provide: 'DocumentRepository',
      useClass: PostgreSQLDocumentRepository,
    },
  ],
  exports: ['DocumentRepository', PrismaService],
})
export class PersistenceModule {}
