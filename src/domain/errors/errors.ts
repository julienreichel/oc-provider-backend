export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class AccessCodeExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccessCodeExpiredError';
  }
}

export class InvalidDocumentStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidDocumentStateError';
  }
}

export class ExternalServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 502,
  ) {
    super(message);
    this.name = 'ExternalServiceError';
  }
}
