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
  ExternalServiceError,
} from '../../../domain/errors/errors';

@Catch(
  NotFoundError,
  AccessCodeExpiredError,
  InvalidDocumentStateError,
  ExternalServiceError,
)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | NotFoundError
      | AccessCodeExpiredError
      | InvalidDocumentStateError
      | ExternalServiceError,
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
    } else if (exception instanceof ExternalServiceError) {
      status =
        typeof exception.statusCode === 'number'
          ? (exception.statusCode as HttpStatus)
          : HttpStatus.BAD_GATEWAY;
      errorCode = 'EXTERNAL_SERVICE_ERROR';
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
