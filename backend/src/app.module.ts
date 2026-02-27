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
import { ContactMessagesModule } from './contact-messages/contact-messages.module';
import { CommentsModule } from './comments/comments.module';
import { HeadlinesModule } from './headlines/headlines.module';
import { RedirectsModule } from './redirects/redirects.module';
import { StatsModule } from './stats/stats.module';
import { TagsModule } from './tags/tags.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';

@Module({
  imports: [PrismaModule, NewsModule, AdsModule, BotModule, CategoriesModule, SettingsModule, UploadModule, ContactMessagesModule, CommentsModule, HeadlinesModule, RedirectsModule, StatsModule, TagsModule, ActivityLogsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
