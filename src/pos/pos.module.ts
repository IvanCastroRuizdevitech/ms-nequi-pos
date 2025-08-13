import { Module } from '@nestjs/common';
import { PosController } from './pos.controller';
import { NequiClientModule } from '../nequi-client/nequi-client.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [NequiClientModule, CommonModule],
  controllers: [PosController],
})
export class PosModule {}

