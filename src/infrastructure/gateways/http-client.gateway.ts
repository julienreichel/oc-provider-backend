import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import {
  ClientGateway,
  ClientDocumentPayload,
  ClientDocumentResponse,
} from '../../application/ports/client-gateway';
import { ExternalServiceError } from '../../domain/errors/errors';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class HttpClientGateway implements ClientGateway {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async sendDocument(
    payload: ClientDocumentPayload,
  ): Promise<ClientDocumentResponse> {
    const baseUrl = this.configService.client.baseUrl;

    if (!baseUrl) {
      throw new ExternalServiceError(
        'Client backend URL is not configured',
        500,
      );
    }

    const endpoint = new URL('/v1/documents', baseUrl).toString();

    try {
      const response = await firstValueFrom(
        this.httpService.post<ClientDocumentResponse>(endpoint, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );

      const accessCode = response.data?.accessCode;
      if (typeof accessCode !== 'string' || accessCode.trim() === '') {
        throw new ExternalServiceError(
          'Client backend returned an invalid response',
          502,
        );
      }

      return { accessCode: accessCode.trim() };
    } catch (error) {
      if (error instanceof ExternalServiceError) {
        throw error;
      }

      const axiosError = error as AxiosError;
      const upstreamStatus = axiosError.response?.status;
      const statusCode =
        typeof upstreamStatus === 'number'
          ? upstreamStatus >= 500
            ? 500
            : 502
          : 502;

      throw new ExternalServiceError(
        'Failed to send document to client backend',
        statusCode,
      );
    }
  }
}
