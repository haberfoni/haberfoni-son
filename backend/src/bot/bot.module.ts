import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
  imports: [ScheduleModule.forRoot(), ActivityLogsModule],
  controllers: [BotController],
  providers: [BotService],
})
export class BotModule { }
