import { Module } from '@nestjs/common';
import { MonitoredGroupsService } from './monitored-groups.service';
import { MonitoredGroupsController } from './monitored-groups.controller';

@Module({
  controllers: [MonitoredGroupsController],
  providers: [MonitoredGroupsService],
  exports: [MonitoredGroupsService],
})
export class MonitoredGroupsModule {}
