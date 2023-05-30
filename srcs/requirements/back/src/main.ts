import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('/etc/ssl/private/backend.key'),
    cert: fs.readFileSync('/etc/ssl/certs/backend.cert'),
  };
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });
  await app.listen(8080);
}
bootstrap();
