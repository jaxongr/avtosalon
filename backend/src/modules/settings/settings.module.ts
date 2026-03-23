import { Module, OnModuleInit } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule implements OnModuleInit {
  constructor(private service: SettingsService) {}

  async onModuleInit() {
    await this.service.seedDefaults();
  }
}
