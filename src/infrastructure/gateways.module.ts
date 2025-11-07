import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HttpClientGateway } from './gateways/http-client.gateway';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.client.baseUrl,
        timeout: 5000,
      }),
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
