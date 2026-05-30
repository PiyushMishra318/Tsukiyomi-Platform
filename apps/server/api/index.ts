import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express } from 'express';
import { AppModule } from './src/app.module';

let cachedApp: Express;

async function bootstrap(): Promise<Express> {
  if (cachedApp) return cachedApp;
  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  app.enableCors({ origin: '*', optionsSuccessStatus: 204 });
  app.setGlobalPrefix('api');
  await app.init();
  cachedApp = expressApp;
  return cachedApp;
}

export default async function handler(req: express.Request, res: express.Response) {
  const app = await bootstrap();
  return app(req, res);
}
