import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { NequiClientModule } from './nequi-client/nequi-client.module';
import { PosModule } from './pos/pos.module';

@Module({
  imports: [
    DatabaseModule,
    CommonModule,
    NequiClientModule,
    PosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
