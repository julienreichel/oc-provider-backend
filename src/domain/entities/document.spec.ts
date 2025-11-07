import { Document } from './document';

describe('Document', () => {
  const baseProps = {
    id: 'doc-1',
    title: 'Sample Title',
    content: 'Sample content body',
    createdAt: new Date('2025-01-01T10:00:00Z'),
  };

  it('defaults to draft status without access code', () => {
    const document = new Document(
      baseProps.id,
      baseProps.title,
      baseProps.content,
      baseProps.createdAt,
    );

    expect(document.status).toBe('draft');
    expect(document.accessCode).toBeNull();
  });

  it('finalizes document and stores normalized access code', () => {
    const document = new Document(
      baseProps.id,
      baseProps.title,
      baseProps.content,
      baseProps.createdAt,
    );

    document.finalize('  FINAL-123  ');

    expect(document.status).toBe('final');
    expect(document.accessCode).toBe('FINAL-123');
  });

  it('throws when attempting to finalize with empty content', () => {
    const document = new Document(
      baseProps.id,
      baseProps.title,
      baseProps.content,
      baseProps.createdAt,
    );
    (document as unknown as { content: string }).content = '   ';

    expect(() => document.finalize('CODE-123')).toThrow(
      'Document content cannot be empty',
    );
  });

  it('throws when attempting to finalize with empty access code', () => {
    const document = new Document(
      baseProps.id,
      baseProps.title,
      baseProps.content,
      baseProps.createdAt,
    );

    expect(() => document.finalize('   ')).toThrow(
      'Access code cannot be empty',
    );
  });

  it('throws when rehydrated as final without access code', () => {
    expect(
      () =>
        new Document(
          baseProps.id,
          baseProps.title,
          baseProps.content,
          baseProps.createdAt,
          'final',
        ),
    ).toThrow('Finalized documents require an access code');
  });

  it('throws when access code is set while status is draft', () => {
    expect(
      () =>
        new Document(
          baseProps.id,
          baseProps.title,
          baseProps.content,
          baseProps.createdAt,
          'draft',
          'CODE-123',
        ),
    ).toThrow('Access code can only be set when document is final');
  });

  it('throws when attempting to finalize an already final document', () => {
    const document = new Document(
      baseProps.id,
      baseProps.title,
      baseProps.content,
      baseProps.createdAt,
    );
    document.finalize('CODE-123');

    expect(() => document.finalize('CODE-456')).toThrow(
      'Document is already finalized',
    );
  });
});
