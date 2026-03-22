import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CarsModule } from './modules/cars/cars.module';
import { LeadsModule } from './modules/leads/leads.module';
import { MonitoredGroupsModule } from './modules/monitored-groups/monitored-groups.module';
import { SmsModule } from './modules/sms/sms.module';
import { UploadModule } from './modules/upload/upload.module';
import { QueueModule } from './modules/queue/queue.module';
import { TelegramBotModule } from './modules/telegram-bot/telegram-bot.module';
import { TelegramUserbotModule } from './modules/telegram-userbot/telegram-userbot.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { CallbackRequestsModule } from './modules/callback-requests/callback-requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CarsModule,
    LeadsModule,
    MonitoredGroupsModule,
    SmsModule,
    UploadModule,
    QueueModule,
    TelegramBotModule,
    TelegramUserbotModule,
    RemindersModule,
    StatisticsModule,
    CallbackRequestsModule,
  ],
})
export class AppModule {}
