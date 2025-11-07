import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HttpClientGateway } from './gateways/http-client.gateway';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
    }),
  ],
  providers: [
    HttpClientGateway,
    {
      provide: 'ClientGateway',
      useExisting: HttpClientGateway,
    },
  ],
  exports: ['ClientGateway'],
})
export class GatewaysModule {}
