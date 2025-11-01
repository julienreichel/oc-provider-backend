import {
  Document,
  DocumentStatus,
} from '../../../../src/domain/entities/document.entity';

describe('Document', () => {
  describe('constructor', () => {
    describe('when valid parameters provided', () => {
      it('should create document instance with correct properties', () => {
        // Given
        const id = '123';
        const title = 'Test Document';
        const content = 'Test content';
        const providerId = 'provider-1';
        const createdAt = new Date('2023-01-01');
        const updatedAt = new Date('2023-01-02');
        const status = DocumentStatus.DRAFT;

        // When
        const document = new Document(
          id,
          title,
          content,
          providerId,
          createdAt,
          updatedAt,
          status,
        );

        // Then
        expect(document.id).toBe(id);
        expect(document.title).toBe(title);
        expect(document.content).toBe(content);
        expect(document.providerId).toBe(providerId);
        expect(document.createdAt).toBe(createdAt);
        expect(document.updatedAt).toBe(updatedAt);
        expect(document.status).toBe(status);
      });
    });
  });

  describe('updateContent', () => {
    describe('when new content provided', () => {
      it('should return new document with updated content and updatedAt', () => {
        // Given
        const originalDocument = new Document(
          '123',
          'Title',
          'Original content',
          'provider-1',
          new Date('2023-01-01'),
          new Date('2023-01-01'),
          DocumentStatus.DRAFT,
        );
        const newContent = 'Updated content';
        const beforeUpdate = Date.now();

        // When
        const updatedDocument = originalDocument.updateContent(newContent);

        // Then
        expect(updatedDocument.content).toBe(newContent);
        expect(updatedDocument.updatedAt.getTime()).toBeGreaterThanOrEqual(
          beforeUpdate,
        );
        expect(updatedDocument.id).toBe(originalDocument.id);
        expect(updatedDocument.title).toBe(originalDocument.title);
        expect(updatedDocument.providerId).toBe(originalDocument.providerId);
        expect(updatedDocument.createdAt).toBe(originalDocument.createdAt);
        expect(updatedDocument.status).toBe(originalDocument.status);
      });
    });
  });

  describe('publish', () => {
    describe('when document is in draft status', () => {
      it('should return new document with published status', () => {
        // Given
        const document = new Document(
          '123',
          'Title',
          'Content',
          'provider-1',
          new Date('2023-01-01'),
          new Date('2023-01-01'),
          DocumentStatus.DRAFT,
        );

        // When
        const publishedDocument = document.publish();

        // Then
        expect(publishedDocument.status).toBe(DocumentStatus.PUBLISHED);
        expect(publishedDocument.id).toBe(document.id);
        expect(publishedDocument.title).toBe(document.title);
        expect(publishedDocument.content).toBe(document.content);
        expect(publishedDocument.providerId).toBe(document.providerId);
        expect(publishedDocument.createdAt).toBe(document.createdAt);
      });
    });

    describe('when document is already published', () => {
      it('should throw error', () => {
        // Given
        const document = new Document(
          '123',
          'Title',
          'Content',
          'provider-1',
          new Date('2023-01-01'),
          new Date('2023-01-01'),
          DocumentStatus.PUBLISHED,
        );

        // When & Then
        expect(() => document.publish()).toThrow(
          'Document is already published',
        );
      });
    });
  });

  describe('isPublished', () => {
    describe('when document status is published', () => {
      it('should return true', () => {
        // Given
        const document = new Document(
          '123',
          'Title',
          'Content',
          'provider-1',
          new Date(),
          new Date(),
          DocumentStatus.PUBLISHED,
        );

        // When
        const result = document.isPublished();

        // Then
        expect(result).toBe(true);
      });
    });

    describe('when document status is not published', () => {
      it('should return false', () => {
        // Given
        const document = new Document(
          '123',
          'Title',
          'Content',
          'provider-1',
          new Date(),
          new Date(),
          DocumentStatus.DRAFT,
        );

        // When
        const result = document.isPublished();

        // Then
        expect(result).toBe(false);
      });
    });
  });
});
