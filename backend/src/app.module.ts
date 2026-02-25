import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { NewsModule } from './news/news.module';
import { AdsModule } from './ads/ads.module';
import { BotModule } from './bot/bot.module';
import { CategoriesModule } from './categories/categories.module';
import { SettingsModule } from './settings/settings.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [PrismaModule, NewsModule, AdsModule, BotModule, CategoriesModule, SettingsModule, UploadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
