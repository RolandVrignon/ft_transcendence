import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const httpsOptions = {
  //   key: fs.readFileSync('/etc/ssl/private/key.pem'),
  //   cert: fs.readFileSync('/etc/ssl/certs/cert.pem'),
  // };
  // const app = await NestFactory.create(AppModule, {
  //   httpsOptions,
  // });
  await app.listen(8080);
}

bootstrap();
