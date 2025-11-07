import { InvalidDocumentStateError } from '../errors/errors';

export type DocumentStatus = 'draft' | 'final';

export class Document {
  public status: DocumentStatus;
  public accessCode: string | null;

  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly content: string,
    public readonly createdAt: Date,
    status: DocumentStatus = 'draft',
    accessCode?: string | null,
  ) {
    this.status = status;
    this.accessCode =
      accessCode === undefined || accessCode === null
        ? null
        : accessCode.trim();

    this.validate();
  }

  finalize(): void {
    if (this.status === 'final') {
      throw new InvalidDocumentStateError('Document is already finalized');
    }

    if (!this.content || this.content.trim() === '') {
      throw new InvalidDocumentStateError('Document content cannot be empty');
    }

    this.status = 'final';
    this.validate();
  }

  assignAccessCode(accessCode: string): void {
    if (this.status !== 'final') {
      throw new InvalidDocumentStateError(
        'Access code can only be assigned to finalized documents',
      );
    }

    const normalizedAccessCode = accessCode?.trim();
    if (!normalizedAccessCode) {
      throw new InvalidDocumentStateError('Access code cannot be empty');
    }

    this.accessCode = normalizedAccessCode;
    this.validate();
  }

  private validate(): void {
    if (!this.id || this.id.trim() === '') {
      throw new InvalidDocumentStateError('Document id cannot be empty');
    }

    if (!this.title || this.title.trim() === '') {
      throw new InvalidDocumentStateError('Document title cannot be empty');
    }

    if (!this.content || this.content.trim() === '') {
      throw new InvalidDocumentStateError('Document content cannot be empty');
    }

    if (!(this.createdAt instanceof Date) || isNaN(this.createdAt.getTime())) {
      throw new InvalidDocumentStateError(
        'Document createdAt must be a valid date',
      );
    }

    if (this.status !== 'draft' && this.status !== 'final') {
      throw new InvalidDocumentStateError(
        'Document status must be draft or final',
      );
    }

    if (this.accessCode && this.accessCode.trim() === '') {
      throw new InvalidDocumentStateError('Access code cannot be empty');
    }

    if (this.accessCode && this.status !== 'final') {
      throw new InvalidDocumentStateError(
        'Access code can only be set when document is final',
      );
    }
  }

  static create(
    id: string,
    title: string,
    content: string,
    createdAt: Date,
    status: DocumentStatus = 'draft',
    accessCode?: string | null,
  ): Document {
    return new Document(id, title, content, createdAt, status, accessCode);
  }
}
