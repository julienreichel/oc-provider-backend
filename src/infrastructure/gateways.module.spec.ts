import { Test, TestingModule } from '@nestjs/testing';
import { GatewaysModule } from './gateways.module';
import { ConfigService } from '../config/config.service';
import { HttpClientGateway } from './gateways/http-client.gateway';

describe('GatewaysModule', () => {
  it('resolves ClientGateway provider with configured base URL', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [GatewaysModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        client: { baseUrl: 'https://client.example.com/api/' },
      })
      .compile();

    const gateway = moduleRef.get<HttpClientGateway>('ClientGateway');
    expect(gateway).toBeInstanceOf(HttpClientGateway);
  });
});
