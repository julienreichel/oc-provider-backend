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

  it('finalizes document without assigning access code', () => {
    const document = new Document(
      baseProps.id,
      baseProps.title,
      baseProps.content,
      baseProps.createdAt,
    );

    document.finalize();

    expect(document.status).toBe('final');
    expect(document.accessCode).toBeNull();
  });

  it('throws when attempting to finalize with empty content', () => {
    const document = new Document(
      baseProps.id,
      baseProps.title,
      baseProps.content,
      baseProps.createdAt,
    );
    (document as unknown as { content: string }).content = '   ';

    expect(() => document.finalize()).toThrow(
      'Document content cannot be empty',
    );
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

  it('assigns access code when document is final', () => {
    const document = new Document(
      baseProps.id,
      baseProps.title,
      baseProps.content,
      baseProps.createdAt,
      'final',
    );

    document.assignAccessCode('  CODE-123  ');

    expect(document.accessCode).toBe('CODE-123');
  });

  it('allows rehydrating finalized document without access code', () => {
    const document = new Document(
      baseProps.id,
      baseProps.title,
      baseProps.content,
      baseProps.createdAt,
      'final',
      null,
    );

    expect(document.status).toBe('final');
    expect(document.accessCode).toBeNull();
  });

  it('throws when assigning empty access code', () => {
    const document = new Document(
      baseProps.id,
      baseProps.title,
      baseProps.content,
      baseProps.createdAt,
      'final',
    );

    expect(() => document.assignAccessCode('   ')).toThrow(
      'Access code cannot be empty',
    );
  });

  it('throws when assigning access code on draft document', () => {
    const document = new Document(
      baseProps.id,
      baseProps.title,
      baseProps.content,
      baseProps.createdAt,
      'draft',
    );

    expect(() => document.assignAccessCode('CODE-123')).toThrow(
      'Access code can only be assigned to finalized documents',
    );
  });

  it('throws when attempting to finalize an already final document', () => {
    const document = new Document(
      baseProps.id,
      baseProps.title,
      baseProps.content,
      baseProps.createdAt,
    );
    document.finalize();

    expect(() => document.finalize()).toThrow('Document is already finalized');
  });
});
