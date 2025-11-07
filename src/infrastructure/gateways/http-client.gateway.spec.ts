import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { of, throwError } from 'rxjs';
import { ConfigService } from '../../config/config.service';
import { ExternalServiceError } from '../../domain/errors/errors';
import { HttpClientGateway } from './http-client.gateway';

describe('HttpClientGateway', () => {
  let httpService: jest.Mocked<HttpService>;
  let configService: Pick<ConfigService, 'client'>;
  let gateway: HttpClientGateway;

  beforeEach(() => {
    httpService = {
      post: jest.fn(),
    } as unknown as jest.Mocked<HttpService>;

    configService = {
      client: {
        baseUrl: 'https://client.example.com',
      },
    };

    gateway = new HttpClientGateway(
      httpService,
      configService as ConfigService,
    );
  });

  it('sends document and returns access code', async () => {
    httpService.post.mockReturnValue(
      of({
        data: { accessCode: 'CODE-123' },
      } as any),
    );

    const result = await gateway.sendDocument({
      id: 'doc-1',
      title: 'Title',
      content: 'Content',
    });

    expect(httpService.post).toHaveBeenCalledWith(
      'https://client.example.com/v1/documents',
      {
        id: 'doc-1',
        title: 'Title',
        content: 'Content',
      },
      expect.any(Object),
    );
    expect(result.accessCode).toBe('CODE-123');
  });

  it('throws ExternalServiceError when response is invalid', async () => {
    httpService.post.mockReturnValue(of({ data: {} } as any));

    await expect(
      gateway.sendDocument({ id: 'doc-1', title: 'Title', content: 'Content' }),
    ).rejects.toThrow(ExternalServiceError);
  });

  it('maps upstream errors to ExternalServiceError', async () => {
    const axiosError = new AxiosError('Bad Request');
    axiosError.response = {
      status: 400,
      statusText: 'Bad Request',
      data: {},
      headers: {},
      config: {},
    } as any;
    httpService.post.mockReturnValue(throwError(() => axiosError));

    await expect(
      gateway.sendDocument({ id: 'doc-1', title: 'Title', content: 'Content' }),
    ).rejects.toThrow(ExternalServiceError);
  });
});
