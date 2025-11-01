export class Document {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly content: string,
    public readonly providerId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly status: DocumentStatus,
  ) {}

  public updateContent(newContent: string): Document {
    return new Document(
      this.id,
      this.title,
      newContent,
      this.providerId,
      this.createdAt,
      new Date(),
      this.status,
    );
  }

  public publish(): Document {
    if (this.status === DocumentStatus.PUBLISHED) {
      throw new Error('Document is already published');
    }

    return new Document(
      this.id,
      this.title,
      this.content,
      this.providerId,
      this.createdAt,
      new Date(),
      DocumentStatus.PUBLISHED,
    );
  }

  public isPublished(): boolean {
    return this.status === DocumentStatus.PUBLISHED;
  }
}

export enum DocumentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}
