import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  NotFoundError,
  AccessCodeExpiredError,
  InvalidDocumentStateError,
} from '../../../domain/errors/errors';

@Catch(NotFoundError, AccessCodeExpiredError, InvalidDocumentStateError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | NotFoundError
      | AccessCodeExpiredError
      | InvalidDocumentStateError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: HttpStatus;
    let errorCode: string;

    if (exception instanceof NotFoundError) {
      status = HttpStatus.NOT_FOUND;
      errorCode = 'NOT_FOUND';
    } else if (exception instanceof AccessCodeExpiredError) {
      status = HttpStatus.GONE; // Resource existed but is no longer available
      errorCode = 'ACCESS_CODE_EXPIRED';
    } else if (exception instanceof InvalidDocumentStateError) {
      status = HttpStatus.BAD_REQUEST;
      errorCode = 'INVALID_DOCUMENT_STATE';
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = 'INTERNAL_SERVER_ERROR';
    }

    response.status(status).json({
      statusCode: status,
      error: errorCode,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
