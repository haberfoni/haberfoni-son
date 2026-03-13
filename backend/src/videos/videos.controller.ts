import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { VideosService } from './videos.service';

@Controller('videos')
export class VideosController {
    constructor(private readonly videosService: VideosService) { }

    @Post()
    create(@Body() createVideoDto: any) {
        return this.videosService.create(createVideoDto);
    }

    @Get()
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('status') status?: 'published' | 'draft',
    ) {
        return this.videosService.findAll({
            page: page ? +page : 1,
            limit: limit ? +limit : 20,
            search,
            status,
        });
    }

    @Get(':idOrSlug')
    findOne(@Param('idOrSlug') idOrSlug: string) {
        if (isNaN(+idOrSlug)) {
            return this.videosService.findBySlug(idOrSlug);
        }
        return this.videosService.findOne(+idOrSlug);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateVideoDto: any) {
        return this.videosService.update(+id, updateVideoDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.videosService.remove(+id);
    }

    @Post('bulk-delete')
    bulkDelete(@Body('ids') ids: number[]) {
        return this.videosService.bulkDelete(ids);
    }

    @Post(':id/increment-views')
    incrementViews(@Param('id') id: string) {
        return this.videosService.incrementViews(+id);
    }
}
