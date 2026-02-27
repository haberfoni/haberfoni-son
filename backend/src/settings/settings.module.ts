import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { EmailSettingsController } from './email-settings.controller';

@Module({
  providers: [SettingsService],
  controllers: [SettingsController, EmailSettingsController]
})
export class SettingsModule { }
