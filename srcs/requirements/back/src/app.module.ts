import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthController, ConnectController } from './controllers/login/auth.controller';

@Module({
  imports: [],
  controllers: [AppController, AuthController, ConnectController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
