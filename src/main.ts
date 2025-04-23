import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import Handlebars from 'handlebars';
import * as exphbs from 'express-handlebars';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log']
  });

  // Xóa toàn bộ phần HMR
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(cookieParser());

  // Sử dụng path tuyệt đối
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });
  
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  // Cấu hình handlebars
  app.engine('hbs', exphbs.create({
    extname: 'hbs',
    partialsDir: join(__dirname, '..', 'views/partials'),
    defaultLayout: 'main',
    helpers: {
      ifEquals: function (arg1: any, arg2: any, options: any) {
        return arg1 === arg2 ? options.fn(this) : options.inverse(this);
      }
    }
  }).engine);

  app.setViewEngine('hbs');

  // Production config
  if (process.env.NODE_ENV === 'production') {
    await app.init();
  } else {
    await app.listen(process.env.PORT || 3000);
  }

  return app;
}

const server = bootstrap()
  .then(app => app.getHttpAdapter().getInstance())
  .catch(error => {
    console.error('Failed to start:', error);
    process.exit(1);
  });

export default server;