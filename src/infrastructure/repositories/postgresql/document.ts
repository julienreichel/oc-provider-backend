import { Injectable } from '@nestjs/common';
import { Document } from '../../../domain/entities/document';
import { DocumentRepository } from '../../../domain/entities/repositories/document-repository';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class PostgreSQLDocumentRepository implements DocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(document: Document): Promise<Document> {
    await this.prisma.document.upsert({
      where: { id: document.id },
      update: {
        title: document.title,
        content: document.content,
        status: document.status,
        accessCode: document.accessCode,
        createdAt: document.createdAt,
      },
      create: {
        id: document.id,
        title: document.title,
        content: document.content,
        status: document.status,
        accessCode: document.accessCode,
        createdAt: document.createdAt,
      },
    });
    return document;
  }

  async findById(id: string): Promise<Document | null> {
    const record = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return new Document(
      record.id,
      record.title,
      record.content,
      record.createdAt,
      record.status,
      record.accessCode,
    );
  }

  async findAll(): Promise<Document[]> {
    const records = await this.prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return records.map(
      (record) =>
        new Document(
          record.id,
          record.title,
          record.content,
          record.createdAt,
          record.status,
          record.accessCode,
        ),
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.document.delete({
      where: { id },
    });
  }

  async clear(): Promise<void> {
    await this.prisma.document.deleteMany({});
  }
}
