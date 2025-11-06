import { DocumentRepository } from '../../domain/entities/repositories/document-repository';
import { DocumentRepository as MemoryDocumentRepository } from '../repositories/memory/document';
import { PostgreSQLDocumentRepository } from '../repositories/postgresql/document';
import { PrismaService } from '../services/prisma.service';

export type RepositoryType = 'memory' | 'postgresql';

export interface TestRepositories {
  documentRepository: DocumentRepository & {
    clear?: () => void | Promise<void>;
  };
  cleanup(): Promise<void>;
}

export class RepositoryFactory {
  static async createRepositories(
    type: RepositoryType = 'memory',
  ): Promise<TestRepositories> {
    switch (type) {
      case 'memory':
        return this.createMemoryRepositories();
      case 'postgresql':
        return this.createPostgreSQLRepositories();
      default:
        throw new Error(`Unsupported repository type: ${String(type)}`);
    }
  }

  private static createMemoryRepositories(): Promise<TestRepositories> {
    const documentRepository = new MemoryDocumentRepository();

    return Promise.resolve({
      documentRepository,
      cleanup() {
        documentRepository.clear();
        return Promise.resolve();
      },
    });
  }

  private static async createPostgreSQLRepositories(): Promise<TestRepositories> {
    const prismaService = new PrismaService();
    await prismaService.onModuleInit();

    const documentRepository = new PostgreSQLDocumentRepository(prismaService);

    return {
      documentRepository,
      async cleanup() {
        await documentRepository.clear();
        await prismaService.$disconnect();
      },
    };
  }
}
