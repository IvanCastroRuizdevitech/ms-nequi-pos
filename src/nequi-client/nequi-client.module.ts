import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NequiClientService } from './nequi-client.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [HttpModule, CommonModule],
  providers: [NequiClientService],
  exports: [NequiClientService],
})
export class NequiClientModule {}

