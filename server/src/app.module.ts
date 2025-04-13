import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TokensController } from './controllers';
import { Erc20Service, TokenService } from './services';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      //envFilePath: `${process.cwd()}/.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ''}`,
    }),
  ],
  controllers: [AppController, TokensController],
  providers: [AppService, Erc20Service, TokenService],
})
export class AppModule {}
