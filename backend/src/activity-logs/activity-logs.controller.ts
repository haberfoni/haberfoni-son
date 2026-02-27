import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';

@Controller('activity-logs')
export class ActivityLogsController {
    constructor(private readonly activityLogsService: ActivityLogsService) { }

    @Post()
    create(@Body() createData: any) {
        return this.activityLogsService.create(createData);
    }

    @Get()
    findAll() {
        return this.activityLogsService.findAll();
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.activityLogsService.remove(+id);
    }
}
