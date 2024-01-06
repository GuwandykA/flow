import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as hls from 'hls-server';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { join } from 'path';
dotenv.config();
const logger = new Logger('main');

const { PORT, HOST } = process.env;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const config = new DocumentBuilder()
    .setTitle('Flow')
    .setDescription('Flow API requests')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const server = await app.listen(PORT);

  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST');
    res.header('Access-Control-Allow-Headers', 'accept, content-type');
    res.header('Access-Control-Max-Age', '1728000');
    next();
  });

  new hls(server, {
    provider: {
      exists: (req, cb) => {
        const ext = req.url.split('.').pop();

        if (ext !== 'm3u8' && ext !== 'ts') {
          return cb(null, true);
        }

        const filePath = join(process.cwd(), `uploads/videos${req.url}`);

        fs.access(filePath, fs.constants.F_OK, function (err) {
          if (err) {
            console.log('File not exist');
            return cb(null, false);
          }
          cb(null, true);
        });
      },
      getManifestStream: (req, cb) => {
        const filePath = join(process.cwd(), `uploads/videos${req.url}`);
        const stream = fs.createReadStream(filePath);
        cb(null, stream);
      },
      getSegmentStream: (req, cb) => {
        const filePath = join(process.cwd(), `uploads/videos${req.url}`);
        const stream = fs.createReadStream(filePath);
        cb(null, stream);
      },
    },
  });
  logger.verbose(`Application running on port ${HOST}:${PORT}`);
}
bootstrap();
