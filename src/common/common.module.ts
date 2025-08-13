import { Module } from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [EquiposService],
  exports: [EquiposService],
})
export class CommonModule {}

