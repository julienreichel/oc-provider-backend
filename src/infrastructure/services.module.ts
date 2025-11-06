import { Module } from '@nestjs/common';
import { SystemClock } from './services/system-clock';
import { UuidIdGenerator } from './services/uuid-id-generator';

@Module({
  providers: [
    {
      provide: 'Clock',
      useClass: SystemClock,
    },
    {
      provide: 'IdGenerator',
      useClass: UuidIdGenerator,
    },
  ],
  exports: ['Clock', 'IdGenerator'],
})
export class ServicesModule {}
