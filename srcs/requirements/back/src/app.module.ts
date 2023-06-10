import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { ConnectController } from './controllers/login/auth.controller';

@Module({
  imports: [],
  controllers: [AppController, ConnectController],
  providers: [AppService],
  // providers: [AppService, PrismaService],
})

export class AppModule {}
