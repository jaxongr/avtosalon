import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { LeadsModule } from './modules/leads/leads.module';
import { MonitoredGroupsModule } from './modules/monitored-groups/monitored-groups.module';
import { SmsModule } from './modules/sms/sms.module';
import { SettingsModule } from './modules/settings/settings.module';
import { TelegramModule } from './modules/telegram/telegram.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    LeadsModule,
    MonitoredGroupsModule,
    SmsModule,
    SettingsModule,
    TelegramModule,
  ],
})
export class AppModule {}
