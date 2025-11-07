import { InvalidDocumentStateError } from '../../domain/errors/errors';

export interface CursorPayload {
  id: string;
  createdAt: Date;
}

const CURSOR_SEPARATOR = '::';

export function encodeCursor(payload: CursorPayload): string {
  const raw = `${payload.createdAt.toISOString()}${CURSOR_SEPARATOR}${payload.id}`;
  return Buffer.from(raw, 'utf8').toString('base64');
}

export function decodeCursor(cursor: string): CursorPayload {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf8');
    const [createdAtIso, id] = decoded.split(CURSOR_SEPARATOR);
    if (!createdAtIso || !id) {
      throw new Error('Invalid cursor format');
    }
    const createdAt = new Date(createdAtIso);
    if (isNaN(createdAt.getTime())) {
      throw new Error('Invalid cursor date');
    }
    return { createdAt, id };
  } catch {
    throw new InvalidDocumentStateError('Invalid pagination cursor');
  }
}
